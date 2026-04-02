# 3D Models Directory Structure

This directory contains all 3D model assets (GLB/GLTF files) used in the Style Fit Studio project.

## Directory Organization

```
public/models/
├── avatars/          # Avatar body models
├── clothing/         # Clothing items (shirts, dresses, etc.)
└── accessories/      # Accessories (hats, shoes, etc.)
```

## Current Models

### Avatar Body Models (`/avatars`)
- `body_archetype_slim.glb` - Slim body type
- `body_archetype_average.glb` - Average body type
- `body_archetype_fit.glb` - Athletic/Fit body type
- `body_archetype_heavy.glb` - Curvy/Plus-size body type
- `body_archetype_muscular.glb` - Muscular body type

### Clothing Models (`/clothing`)
- `tshirt_base.glb` - Basic T-shirt base model

### Accessories (`/accessories`)
- *None currently* - Ready for future accessories

## Adding New Models

### For New Body Types

1. **Place the GLB file** in `public/models/avatars/`
2. **Update configuration** in `src/lib/models-config.ts`:
   ```typescript
   export const BODY_MODELS = {
     newType: {
       path: "/models/avatars/body_archetype_newtype.glb",
       label: "New Type",
       category: "body"
     },
     // ... existing models
   }
   ```
3. The component will automatically preload and make it available

### For New Clothing Items

1. **Place the GLB file** in `public/models/clothing/`
2. **Update configuration** in `src/lib/models-config.ts`:
   ```typescript
   export const CLOTHING_MODELS = {
     dress: {
       path: "/models/clothing/dress_base.glb",
       label: "Dress",
       category: "clothing",
       colorable: true
     },
     // ... existing models
   }
   ```
3. **Use in AvatarViewer** component:
   ```tsx
   <AvatarViewer 
     bodyType="average"
     skinToneHsl="30 70 60"
     clothingType="dress"
     clothingColor="0 0 20"
   />
   ```

### For Accessories

1. **Create directory** if needed: `public/models/accessories/`
2. **Place the GLB file** in `public/models/accessories/`
3. **Update configuration** in `src/lib/models-config.ts`
4. **Extend AvatarViewer** to support accessories rendering

## Model Requirements

- **Format**: GLB (Binary glTF) - preferred for better performance
- **Size**: Keep under 5MB per model for optimal loading
- **Structure**: Single mesh or logically grouped meshes
- **Scale**: Ensure proper scale relative to body models
- **Materials**: Use standard PBR materials for consistent shading

## Model Optimization Tips

1. **Reduce polygon count** - Aim for 10,000-50,000 polygons per model
2. **Use texture atlasing** - Combine multiple textures into one
3. **Bake lighting** - When possible, bake lighting into textures
4. **LOD models** - Consider creating lower-detail LOD variants for performance

## Using the Models in Components

### In React Components

```tsx
import { AvatarViewer } from '@/components';

export function FittingRoom() {
  return (
    <AvatarViewer 
      bodyType="athletic"
      skinToneHsl="30 70 60"
      clothingType="tshirt"
      clothingColor="0 100 50" // Red shirt
    />
  );
}
```

### Accessing Model Configuration

```tsx
import { BODY_MODELS, CLOTHING_MODELS, getAllModelPaths } from '@/lib/models-config';

// Get all available body types
const bodyTypes = Object.entries(BODY_MODELS).map(([key, model]) => ({
  id: key,
  label: model.label
}));

// Get all model paths for preloading
const allPaths = getAllModelPaths();
```

## Color System

The application uses HSL (Hue, Saturation, Lightness) format for colors:

- **Hue**: 0-360 (color wheel degrees)
- **Saturation**: 0-100 (color intensity)
- **Lightness**: 0-100 (brightness)

**Examples:**
- `"30 70 60"` - Warm skin tone
- `"0 100 50"` - Pure red
- `"200 100 50"` - Pure blue
- `"0 0 50"` - Gray

## Material Customization

Models support dynamic material customization:

- **Color**: Applied to all surfaces
- **Roughness**: Surface texture (0-1, default: 0.7 for body, 0.5 for clothing)
- **Metalness**: Metallic properties (0-1, default: 0.05 for body, 0.0 for clothing)

## Performance Considerations

- Models are **preloaded** automatically when the app starts
- Duplicate models use the same mesh in memory
- Use `Suspense` boundary for loading states
- Consider lazy-loading for accessories

## Troubleshooting

### Model doesn't appear
- Check the path in `models-config.ts`
- Verify the file exists in the correct directory
- Check browser console for load errors

### Color not applying correctly
- Ensure the HSL format is correct: `"0 100 50"`
- Check that the model has materials (not just geometry)
- Verify material type supports color (MeshStandardMaterial)

### Performance issues
- Reduce polygon count
- Check file size (should be < 5MB)
- Clear browser cache and rebuild

## Future Enhancements

- [ ] Add shoe models
- [ ] Add hat/accessories
- [ ] Add hair customization
- [ ] Add pattern/texture options for clothing
- [ ] Add animation support
- [ ] Create model editor tool for easy customization
