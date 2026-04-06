import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment, ContactShadows, SpotLight, Grid, Sparkles, Float, Html } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState, useMemo } from "react";
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

interface FitFeedback {
  chest?: string;
  waist?: string;
  hips?: string;
}

interface BodyModelProps {
  bodyType: string;
  gender: string;
  skinToneHsl: string;
  measurements?: any;
  clothingType?: string;
  clothingColor?: string;
  fitFeedback?: FitFeedback;
}

function BodyModel({ bodyType, gender, skinToneHsl, measurements, clothingType, clothingColor, fitFeedback }: BodyModelProps) {
  const currentGender = (gender || "unisex").toLowerCase();
  
  // Add hover & interaction state
  const [hovered, setHovered] = useState(false);
  
  // Use bodyType mapped to BODY_MODEL_MAP
  const resolvedBodyType = bodyType?.toLowerCase() || "average";
  let modelPath = BODY_MODEL_MAP[resolvedBodyType] || BODY_MODEL_MAP.average;

  const { scene } = useGLTF(modelPath);
  const groupRef = useRef<THREE.Group>(null);
const sceneRef = useRef<any>(null);

  // Load clothing if specified
  const clothingUrl = (clothingType && CLOTHING_MODEL_MAP[clothingType]) 
    ? CLOTHING_MODEL_MAP[clothingType] 
    : BODY_MODEL_MAP.average; // safe fallback to already loaded model
  
  const clothingGltf = useGLTF(clothingUrl);
  const clothingScene = (clothingType && CLOTHING_MODEL_MAP[clothingType]) ? clothingGltf.scene : null;

  useEffect(() => {
    if (!groupRef.current || !scene) return;

    try {
      // Clear previous content
      while (groupRef.current.children.length > 0) {
        groupRef.current.remove(groupRef.current.children[0]);
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

      // Base measurements for calculating ratios
      const default_chest = 90;
      const default_waist = 70;

      // Get user measurements with fallbacks
      const user_chest = measurements?.chest || measurements?.bust || default_chest;
      const user_waist = measurements?.waist || default_waist;
      const user_height = measurements?.height || 170;

      // Calculate simple scales based on user request (PART 5)
      const width_scale = user_chest / default_chest;
      const waist_scale = user_waist / default_waist;

      // PART 1: BODY PARAMETERS
      // fat_score = waist / height
      // muscle_score = chest / waist
      let fat_score = user_waist / user_height;
      let muscle_score = user_chest / user_waist;

      // Normalize between an expected range to map to 0..1 loosely
      fat_score = Math.max(0, Math.min(1, (fat_score - 0.35) / 0.25));
      muscle_score = Math.max(0, Math.min(1, (muscle_score - 1.0) / 0.4));

      // PART 3: INTERPOLATION LOGIC
      let slim_val = Math.max(0, Math.min(1, 1 - fat_score));
      let fat_val = Math.max(0, Math.min(1, fat_score));
      let muscular_val = Math.max(0, Math.min(1, muscle_score));

      // Normalize total influence to avoid distortion
      const totalInf = slim_val + fat_val + muscular_val;
      if (totalInf > 0) {
        slim_val /= totalInf;
        fat_val /= totalInf;
        muscular_val /= totalInf;
      }

      let morphApplied = false;

      // PART 2 & 4: MORPH TARGET SYSTEM AND REAL-TIME UPDATE
      clonedScene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.morphTargetDictionary && child.morphTargetInfluences) {
            const dict = child.morphTargetDictionary;
            const inf = child.morphTargetInfluences;
            
            if ('slim' in dict) { inf[dict['slim']] = slim_val; morphApplied = true; }
            if ('fat' in dict) { inf[dict['fat']] = fat_val; morphApplied = true; }
            if ('muscular' in dict) { inf[dict['muscular']] = muscular_val; morphApplied = true; }
          }
        }
      });

      console.log("Morph Targets:", { slim_val, fat_val, muscular_val, morphApplied });

      // Apply transformations directly to the group based on requirements
      if (morphApplied) {
        groupRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
      } else {
        groupRef.current.scale.set(
          scaleFactor * width_scale, 
          scaleFactor * 1.0, 
          scaleFactor * waist_scale
        );
      }
      
      // Position: center horizontally, bottom sits at y=0
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
            // Apply morph targets to clothing if present
            if (morphApplied && child.morphTargetDictionary && child.morphTargetInfluences) {
              const dict = child.morphTargetDictionary;
              const inf = child.morphTargetInfluences;
              if ('slim' in dict) inf[dict['slim']] = slim_val;
              if ('fat' in dict) inf[dict['fat']] = fat_val;
              if ('muscular' in dict) inf[dict['muscular']] = muscular_val;
            }

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
        // (Removed complex modifyProportions, scaling is handled at group level)

        groupRef.current.add(clonedClothing);
      }
    } catch (error) {
      console.error("Error setting up avatar:", error);
    }
  }, [scene, skinToneHsl, clothingScene, clothingColor, measurements, bodyType, gender]);

  // Idle animation (Part 2: Add idle animation)
  useFrame((state) => {
    if (groupRef.current) {
      // Subtle float or idle breathing
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.01;
      // Hover glow effect logic via emissive modification or similar could be placed here
    }
  });

  const getFitColor = (status: string) => {
    if (!status) return "text-gray-500 border-gray-500 bg-gray-500/10";
    const l = status.toLowerCase();
    if (l.includes("perfect")) return "text-emerald-500 border-emerald-500 bg-emerald-500/20";
    if (l.includes("tight")) return "text-rose-500 border-rose-500 bg-rose-500/20";
    if (l.includes("loose")) return "text-amber-500 border-amber-500 bg-amber-500/20";
    return "text-indigo-500 border-indigo-500 bg-indigo-500/20";
  };

  return (
    <group 
      ref={groupRef}
      position={[0, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Show Outline/Glow when hovered (Part 2) */}
      {hovered && (
        <mesh scale={1.05} position={[0, 1, 0]}>
           <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
           <meshBasicMaterial color="#00ffff" transparent opacity={0.1} wireframe />
        </mesh>
      )}

      {/* Visual Fit Feedback Overlay (Part 3) */}
      {fitFeedback && (
        <>
          {fitFeedback.chest && (
            <Html position={[0.2, 1.4, 0.2]} center className="pointer-events-none transition-all duration-300">
              <div className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-md border shadow-lg ${getFitColor(fitFeedback.chest)} animate-fade-in`}>
                Chest: {fitFeedback.chest}
              </div>
            </Html>
          )}
          {fitFeedback.waist && (
            <Html position={[0.25, 1.0, 0.2]} center className="pointer-events-none transition-all duration-300 delay-100">
              <div className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-md border shadow-lg ${getFitColor(fitFeedback.waist)} animate-fade-in`}>
                Waist: {fitFeedback.waist}
              </div>
            </Html>
          )}
          {fitFeedback.hips && (
            <Html position={[0.3, 0.8, 0.2]} center className="pointer-events-none transition-all duration-300 delay-200">
              <div className={`px-2 py-1 rounded-full text-xs font-bold backdrop-blur-md border shadow-lg ${getFitColor(fitFeedback.hips)} animate-fade-in`}>
                Hips: {fitFeedback.hips}
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh position={[0, 1, 0]}>
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
  fitFeedback?: FitFeedback;
}

export default function AvatarViewer({ bodyType, gender, skinToneHsl, measurements, garment, fitFeedback }: AvatarViewerProps) {
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
    // Avoid calling useGLTF in useEffect, as it's a hook.
    setCameraConfig({ distance: 5.5, offsetY: 1.0, targetY: 1.0 });
  }, [bodyType]);

  // Setup an intro camera animation
  function CameraRig({ targetY, distance }: { targetY: number, distance: number }) {
    useFrame((state) => {
      // Smoothly interpolate camera view on load
      state.camera.position.lerp(new THREE.Vector3(0, targetY, distance), 0.05);
      state.camera.lookAt(0, targetY, 0);
    });
    return null;
  }

  return (
    <Canvas
      camera={{ 
        position: [0, cameraConfig.offsetY, cameraConfig.distance * 1.5], // Start further away for zoom in
        fov: 40,
        near: 0.1,
        far: 1000
      }}
      style={{ width: "100%", height: "100%", background: "radial-gradient(circle at center, #1b0033 0%, #000000 100%)" }} // Deep dark purple/black gradient
      gl={{ 
        antialias: true, 
        toneMapping: THREE.ACESFilmicToneMapping,
        powerPreference: "high-performance"
      }}
    >
      <CameraRig targetY={cameraConfig.targetY} distance={cameraConfig.distance} />

      <color attach="background" args={["#050510"]} />
      <fog attach="fog" args={["#050510", 3, 15]} />

      {/* Gaming/Cyberpunk Atmospheric Lighting */}
      <ambientLight intensity={0.4} />
      <SpotLight
        position={[0, 8, 0]}
        angle={1.2}
        penumbra={0.7}
        intensity={3}
        color="#d8b4fe"
        castShadow
        distance={20}
      />
      <directionalLight position={[4, 5, 5]} intensity={1.5} color="#3b82f6" />
      <directionalLight position={[-4, 3, -4]} intensity={1.5} color="#ec4899" />

      {/* Floating Sparkles in the background */}
      <Sparkles count={50} scale={6} size={2} speed={0.4} opacity={0.2} color="#a855f7" />

      <Suspense fallback={<LoadingFallback />}>
        {/* High-Tech Stage/Pedestal */}
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
          <group position={[0, -0.05, 0]}>
            <mesh receiveShadow>
              <cylinderGeometry args={[1.5, 1.8, 0.1, 64]} />
              <meshStandardMaterial color="#0b0f19" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.051, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[1.3, 1.4, 64]} />
              <meshBasicMaterial color="#a855f7" opacity={0.8} transparent />
            </mesh>
            <mesh position={[0, 0.055, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.9, 1.0, 64]} />
              <meshBasicMaterial color="#38bdf8" opacity={0.6} transparent />
            </mesh>
          </group>
        </Float>

        {/* Holographic Grid Floor */}
        <Grid 
          position={[0, -0.06, 0]} 
          args={[40, 40]} 
          cellSize={0.6} 
          cellThickness={1.2} 
          cellColor="#000000" 
          sectionSize={3} 
          sectionThickness={1.5} 
          sectionColor="#2e1065" 
          fadeDistance={15} 
          fadeStrength={1} 
        />

        <BodyModel
          key={`${bodyType}-${gender}`}
          bodyType={bodyType}
          gender={gender || "unisex"}
          skinToneHsl={skinToneHsl}
          measurements={measurements}
          clothingType={clothingType}
          clothingColor={clothingColor}
          fitFeedback={fitFeedback}
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
        autoRotate={true}
        autoRotateSpeed={0.5}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={Math.max(cameraConfig.distance * 0.75, 3.5)}
        maxDistance={Math.max(cameraConfig.distance * 1.8, 10)}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI * 0.85}
        target={[0, cameraConfig.targetY, 0]}
      />
    </Canvas>
  );
}
