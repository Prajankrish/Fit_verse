import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows, SpotLight, Grid } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

// Body archetype models
const BODY_MODEL_MAP: Record<string, string> = {
  slim: "/models/avatars/body_archetype_slim.glb",
  petite: "/models/avatars/body_archetype_slim.glb",
  average: "/models/avatars/body_archetype_average.glb",
  curvy: "/models/avatars/body_archetype_heavy.glb",
  plussize: "/models/avatars/body_archetype_heavy.glb",
  athletic: "/models/avatars/body_archetype_fit.glb",
  muscular: "/models/avatars/body_archetype_muscular.glb",
  tall: "/models/avatars/body_archetype_slim.glb",
};

// Clothing models
const CLOTHING_MODEL_MAP: Record<string, string> = {
  tshirt: "/models/clothing/tshirt_base.glb",
};

interface BodyModelProps {
  bodyType: string;
  gender: string;
  skinToneHsl: string;
  measurements?: any;
  clothingType?: string;
  clothingColor?: string;
}

function BodyModel({ bodyType, gender, skinToneHsl, measurements, clothingType, clothingColor }: BodyModelProps) {
  const currentGender = (gender || "unisex").toLowerCase();
  
  // Decide base model based on gender as requested
  let modelPath = BODY_MODEL_MAP.average; // unisex fallback
  if (currentGender === "male") {
    modelPath = "/models/avatars/body_archetype_fit.glb";
  } else if (currentGender === "female") {
    modelPath = BODY_MODEL_MAP[bodyType] || "/models/avatars/body_archetype_slim.glb";
  }

  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  // Load clothing if specified
  let clothingScene: THREE.Scene | null = null;
  if (clothingType && CLOTHING_MODEL_MAP[clothingType]) {
    try {
      clothingScene = useGLTF(CLOTHING_MODEL_MAP[clothingType]).scene;
    } catch (error) {
      console.error(`Failed to load clothing:`, error);
    }
  }

  useEffect(() => {
    if (!groupRef.current || !scene) return;

    try {
      // Clear previous content
      while (groupRef.current.children.length > 0) {
        groupRef.current.removeChild(groupRef.current.children[0]);
      }

      // Clone the scene to avoid mutating original
      const clonedScene = scene.clone();
      sceneRef.current = clonedScene;

      // Calculate bounding box for the cloned scene
      const box = new THREE.Box3();
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          box.expandByObject(child);
        }
      });

      if (box.isEmpty()) {
        // Fallback bounding box
        box.setFromObject(clonedScene);
      }

      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      // Normalize height to 2.0 units
      const targetHeight = 2.0;
      const currentHeight = Math.max(size.y, 0.1);
      const scaleFactor = targetHeight / currentHeight;

      // Allow 3D Mesh to dynamically deform slightly based on manual measurements
      const getBaseMeasurements = (type: string) => {
        if (type === 'slim' || type === 'petite' || type === 'tall') return { bust: 82, waist: 62, hips: 88 };
        if (type === 'curvy' || type === 'plussize') return { bust: 108, waist: 88, hips: 114 };
        if (type === 'athletic' || type === 'muscular') return { bust: 96, waist: 72, hips: 98 };
        return { bust: 90, waist: 70, hips: 95 };
      };

      const baseMetrics = getBaseMeasurements(bodyType);
      const BASE_HEIGHT = 170;
      const BASE_BUST = baseMetrics.bust;
      const BASE_WAIST = baseMetrics.waist;
      const BASE_HIPS = baseMetrics.hips;

      const userHeight = measurements?.height || 170;
      const userHeightScale = userHeight / BASE_HEIGHT;

      // Apply body type specific width modifiers as requested
      let bodyTypeScale = 1.0;
      if (bodyType === 'slim') bodyTypeScale = 0.92;
      else if (bodyType === 'average') bodyTypeScale = 1.0;
      
      const chestRatio = ((measurements?.bust || BASE_BUST) / BASE_BUST) * (bodyType === 'muscular' ? 1.15 : 1.0);
      const waistRatio = ((measurements?.waist || BASE_WAIST) / BASE_WAIST);
      const hipsRatio = ((measurements?.hips || BASE_HIPS) / BASE_HIPS);

      const userWidthScale = measurements ? (
        chestRatio * 0.35 +
        waistRatio * 0.3 +
        hipsRatio * 0.35
      ) * bodyTypeScale : 1 * bodyTypeScale;

      const userDepthScale = userWidthScale * 1.05;

      // Make minor vertex adjustments for specific body parts (Chest, Waist, Hips)
      const modifyProportions = (meshGroup: THREE.Object3D) => {
        meshGroup.traverse((child) => {
          if (child instanceof THREE.Mesh && child.geometry && child.geometry.attributes.position) {
            const pos = child.geometry.attributes.position;
            // Create a clone to not permanently ruin the cached GLTF scene if it gets reused
            child.geometry = child.geometry.clone();
            const newPos = child.geometry.attributes.position;
            
            for (let i = 0; i < newPos.count; i++) {
              const y = newPos.getY(i);
              const normY = (y - box.min.y) / currentHeight;
              
              let localScale = 1.0;
              if (normY >= 0.70) {
                localScale = chestRatio / userWidthScale; // scale relative to the base uniform scale
              } else if (normY <= 0.40) {
                localScale = hipsRatio / userWidthScale;
              } else {
                if (normY > 0.55) {
                  const t = (normY - 0.55) / 0.15;
                  localScale = (waistRatio * (1 - t) + chestRatio * t) / userWidthScale;
                } else {
                  const t = (normY - 0.40) / 0.15;
                  localScale = (hipsRatio * (1 - t) + waistRatio * t) / userWidthScale;
                }
              }
              // Apply the effect more strongly to match manual sliders
              localScale = 1.0 + (localScale - 1.0) * 0.85;

              newPos.setX(i, newPos.getX(i) * localScale);
              newPos.setZ(i, newPos.getZ(i) * localScale);
            }
            newPos.needsUpdate = true;
          }
        });
      };

      modifyProportions(clonedScene);

      // Apply transformations directly to the group
      groupRef.current.scale.set(scaleFactor * userWidthScale, scaleFactor * userHeightScale, scaleFactor * userDepthScale);
      
      // Position: center horizontally, bottom sits at y=0, then raise slightly for shadow
      groupRef.current.position.set(0, 0, 0);
      clonedScene.position.set(
        -center.x,
        -box.min.y,
        -center.z
      );

      // Add the cloned scene to group
      groupRef.current.add(clonedScene);

      // Apply skin tone
      const parts = skinToneHsl.split(" ");
      const h = parseFloat(parts[0]) / 360;
      const s = parseFloat(parts[1]) / 100;
      const l = parseFloat(parts[2]) / 100;
      const skinColor = new THREE.Color().setHSL(h, s, l);

      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            child.material = child.material.map((mat) => {
              const clonedMat = (mat as THREE.MeshStandardMaterial).clone();
              clonedMat.color = skinColor;
              clonedMat.roughness = 0.7;
              clonedMat.metalness = 0.05;
              return clonedMat;
            });
          } else {
            const mat = child.material as THREE.MeshStandardMaterial;
            if (mat) {
              const clonedMat = mat.clone();
              clonedMat.color = skinColor;
              clonedMat.roughness = 0.7;
              clonedMat.metalness = 0.05;
              child.material = clonedMat;
            }
          }
        }
      });

      // Apply clothing if specified
      if (clothingScene && clothingColor) {
        const clonedClothing = clothingScene.clone();

        // Apply same transform as body
        clonedClothing.scale.set(scaleFactor, scaleFactor, scaleFactor);
        clonedClothing.position.set(
          -center.x,
          -box.min.y,
          -center.z
        );

        const clothParts = clothingColor.split(" ");
        const ch = parseFloat(clothParts[0]) / 360;
        const cs = parseFloat(clothParts[1]) / 100;
        const cl = parseFloat(clothParts[2]) / 100;
        const clothColorObj = new THREE.Color().setHSL(ch, cs, cl);

        clonedClothing.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (Array.isArray(child.material)) {
              child.material = child.material.map((mat) => {
                const clonedMat = (mat as THREE.MeshStandardMaterial).clone();
                clonedMat.color = clothColorObj;
                clonedMat.roughness = 0.5;
                clonedMat.metalness = 0.0;
                return clonedMat;
              });
            } else {
              const mat = child.material as THREE.MeshStandardMaterial;
              if (mat) {
                const clonedMat = mat.clone();
                clonedMat.color = clothColorObj;
                clonedMat.roughness = 0.5;
                clonedMat.metalness = 0.0;
                child.material = clonedMat;
              }
            }
          }
        });

        // Apply the same morphological proportions to clothing
        modifyProportions(clonedClothing);

        groupRef.current.add(clonedClothing);
      }
    } catch (error) {
      console.error("Error setting up avatar:", error);
    }
  }, [scene, skinToneHsl, clothingScene, clothingColor, measurements, bodyType, gender]);

  return (
    <group ref={groupRef} position={[0, 0.1, 0]} />
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <capsuleGeometry args={[0.3, 1, 8, 16]} />
      <meshStandardMaterial color="#888" wireframe />
    </mesh>
  );
}

interface AvatarViewerProps {
  bodyType: string;
  gender?: string;
  skinToneHsl: string;
  measurements?: any;
  garment?: any;
}

export default function AvatarViewer({ bodyType, gender, skinToneHsl, measurements, garment }: AvatarViewerProps) {
  let clothingType = undefined;
  let clothingColor = undefined;

  if (garment) {
    const title = (garment.title || "").toLowerCase();
    const typeStr = (garment.articleType || garment.subCategory || "").toLowerCase();

    if (typeStr.includes("t-shirt") || typeStr.includes("top") || title.includes("shirt")) {
      clothingType = "t-shirt";
    } else if (typeStr.includes("jeans") || typeStr.includes("trouser") || title.includes("pant")) {
      clothingType = "jeans";
    } else if (typeStr.includes("dress") || title.includes("dress")) {
      clothingType = "dress";
    }

    clothingColor = garment.baseColour || "#ffffff";
  }

  const [cameraConfig, setCameraConfig] = useState({ 
    distance: 5.5,    // Default safe distance
    offsetY: 1.0,     // Center avatar vertically
    targetY: 1.0      // Look at center of avatar
  });

  // Preload models as needed
  useEffect(() => {
    const modelPath = BODY_MODEL_MAP[bodyType] || BODY_MODEL_MAP.average;
    useGLTF.preload(modelPath);
  }, [bodyType]);

  // Calculate camera config based on body type using preloaded models
  useEffect(() => {
    try {
      const modelPath = BODY_MODEL_MAP[bodyType] || BODY_MODEL_MAP.average;
      const glb = useGLTF(modelPath);
      const scene = glb.scene;

      if (!scene) return;

      // Analyze model dimensions
      const box = new THREE.Box3();
      scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          box.expandByObject(child);
        }
      });

      if (box.isEmpty()) {
        box.setFromObject(scene);
      }

      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      // Normalize height to 2.0 units
      const targetHeight = 2.0;
      const currentHeight = Math.max(size.y, 0.1);
      const scaleFactor = targetHeight / currentHeight;
      const scaledHeight = size.y * scaleFactor;
      const scaledWidth = size.x * scaleFactor;

      // IMPROVED CAMERA CALCULATION
      // For aspect 3:4 viewport, we need to fit in vertical space primarily
      // FOV: 42°, desired coverage: 85% of viewport height with 15% headroom
      
      const vFOV = (42 * Math.PI) / 180; // Convert to radians
      const height = 2 * Math.tan(vFOV / 2) * 5.5; // At distance 5.5
      
      // Required distance to fit avatar height in 85% of viewport
      const desiredVerticalCoverage = 0.85;
      const requiredDistance = scaledHeight / (2 * Math.tan(vFOV / 2) * desiredVerticalCoverage);
      
      // Also account for width (aspect ratio)
      const horizontalFOV = vFOV * (3/4); // Approximate horizontal based on 3:4 aspect
      const requiredDistanceForWidth = scaledWidth / (2 * Math.tan(horizontalFOV / 2) * 0.9);
      
      // Take the larger of the two to ensure full visibility
      const finalDistance = Math.max(requiredDistance, requiredDistanceForWidth, 4.5);
      
      // Position avatar center at sweet spot (middle-upper area for good composition)
      // Avatar will be positioned from y=0 (feet) to y=scaledHeight (head)
      // We want the visual center around 1.0 for good framing
      const avatarVisualCenter = scaledHeight / 2; // Middle of avatar
      
      setCameraConfig({
        distance: finalDistance,
        offsetY: avatarVisualCenter + 0.5, // Slight upward bias for better composition
        targetY: avatarVisualCenter + 0.3  // Look at upper-middle of avatar
      });
    } catch (error) {
      console.warn("Camera calibration failed, using safe defaults:", error);
      setCameraConfig({ distance: 5.5, offsetY: 1.0, targetY: 1.0 });
    }
  }, [bodyType]);

  return (
    <Canvas
      camera={{ 
        position: [0, cameraConfig.offsetY, cameraConfig.distance], 
        fov: 42,
        near: 0.1,
        far: 1000
      }}
      style={{ width: "100%", height: "100%" }}
      gl={{ 
        antialias: true, 
        toneMapping: THREE.ACESFilmicToneMapping,
        powerPreference: "high-performance"
      }}
    >
      <color attach="background" args={["#0a0b10"]} />
      
      {/* Gaming/Cyberpunk Atmospheric Lighting */}
      <ambientLight intensity={0.3} />
      <SpotLight
        position={[0, 6, 0]}
        angle={0.8}
        penumbra={0.5}
        intensity={2.5}
        color="#c4b5fd"
        castShadow
      />
      <SpotLight
        position={[3, 3, 4]}
        angle={0.6}
        penumbra={0.8}
        intensity={2}
        color="#818cf8"
      />
      <SpotLight
        position={[-4, 2, -4]}
        angle={0.6}
        penumbra={0.8}
        intensity={2}
        color="#f472b6"
      />
      <directionalLight position={[0, 2, 5]} intensity={0.5} />

      <Suspense fallback={<LoadingFallback />}>
        {/* High-Tech Stage/Pedestal */}
        <group position={[0, -0.05, 0]}>
          <mesh receiveShadow>
            <cylinderGeometry args={[1.2, 1.3, 0.1, 64]} />
            <meshStandardMaterial color="#1a1b26" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.1, 1.15, 64]} />
            <meshBasicMaterial color="#a855f7" />
          </mesh>
          <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.8, 0.82, 64]} />
            <meshBasicMaterial color="#38bdf8" opacity={0.5} transparent />
          </mesh>
        </group>

        {/* Grid Floor */}
        <Grid 
          position={[0, -0.06, 0]} 
          args={[30, 30]} 
          cellSize={0.5} 
          cellThickness={1} 
          cellColor="#1e1e24" 
          sectionSize={2.5} 
          sectionThickness={1.5} 
          sectionColor="#4c1d95" 
          fadeDistance={10} 
          fadeStrength={2} 
        />

        <BodyModel
          key={`${bodyType}-${gender}`}
          bodyType={bodyType}
          gender={gender || "unisex"}
          skinToneHsl={skinToneHsl}
          measurements={measurements}
          clothingType={clothingType}
          clothingColor={clothingColor}
        />
        <ContactShadows
          position={[0, -0.04, 0]}
          opacity={0.8}
          scale={5}
          blur={2.5}
          color="#000000"
        />
        <Environment preset="night" environmentIntensity={0.6} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={Math.max(cameraConfig.distance * 0.75, 3.5)}
        maxDistance={Math.max(cameraConfig.distance * 1.8, 10)}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.85}
        target={[0, cameraConfig.targetY, 0]}
        autoRotate={false}
      />
    </Canvas>
  );
}
