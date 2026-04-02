/**
 * 3D Models Configuration
 * 
 * Central configuration for all 3D models used in the application.
 * Add new models here to automatically preload and make them available
 * throughout the application.
 */

// Body Models Configuration
export const BODY_MODELS = {
  slim: {
    path: "/models/avatars/body_archetype_slim.glb",
    label: "Slim",
    category: "body"
  },
  petite: {
    path: "/models/avatars/body_archetype_slim.glb",
    label: "Petite",
    category: "body"
  },
  average: {
    path: "/models/avatars/body_archetype_average.glb",
    label: "Average",
    category: "body"
  },
  athletic: {
    path: "/models/avatars/body_archetype_fit.glb",
    label: "Athletic",
    category: "body"
  },
  curvy: {
    path: "/models/avatars/body_archetype_heavy.glb",
    label: "Curvy",
    category: "body"
  },
  plussize: {
    path: "/models/avatars/body_archetype_heavy.glb",
    label: "Plus Size",
    category: "body"
  },
  muscular: {
    path: "/models/avatars/body_archetype_muscular.glb",
    label: "Muscular",
    category: "body"
  },
  tall: {
    path: "/models/avatars/body_archetype_average.glb",
    label: "Tall",
    category: "body"
  }
} as const;

// Clothing Models Configuration
export const CLOTHING_MODELS = {
  tshirt: {
    path: "/models/clothing/tshirt_base.glb",
    label: "T-Shirt",
    category: "clothing",
    colorable: true
  }
} as const;

// Accessories Models Configuration (for future use)
export const ACCESSORY_MODELS = {
  // Add accessories here as they're created
  // hat: {
  //   path: "/models/accessories/hat_base.glb",
  //   label: "Hat",
  //   category: "accessories"
  // }
} as const;

// Model Categories for easy filtering
export const MODEL_CATEGORIES = {
  body: "Body Types",
  clothing: "Clothing",
  accessories: "Accessories"
} as const;

// Get all model paths for preloading
export const getAllModelPaths = (): string[] => {
  const paths: string[] = [];
  
  Object.values(BODY_MODELS).forEach(model => paths.push(model.path));
  Object.values(CLOTHING_MODELS).forEach(model => paths.push(model.path));
  Object.values(ACCESSORY_MODELS).forEach(model => paths.push(model.path));
  
  return [...new Set(paths)]; // Remove duplicates
};

// Type helpers
export type BodyType = keyof typeof BODY_MODELS;
export type ClothingType = keyof typeof CLOTHING_MODELS;
export type AccessoryType = keyof typeof ACCESSORY_MODELS;
export type ModelType = BodyType | ClothingType | AccessoryType;

// Get model path by key
export const getModelPath = (modelKey: string, category: "body" | "clothing" | "accessories"): string | null => {
  const models = {
    body: BODY_MODELS,
    clothing: CLOTHING_MODELS,
    accessories: ACCESSORY_MODELS
  };
  
  const model = models[category][modelKey as any];
  return model ? model.path : null;
};

// Export a flat map for backward compatibility
export const BODY_MODEL_MAP: Record<string, string> = Object.entries(BODY_MODELS).reduce(
  (acc, [key, model]) => {
    acc[key] = model.path;
    return acc;
  },
  {} as Record<string, string>
);

export const CLOTHING_MODEL_MAP: Record<string, string> = Object.entries(CLOTHING_MODELS).reduce(
  (acc, [key, model]) => {
    acc[key] = model.path;
    return acc;
  },
  {} as Record<string, string>
);
