# 🎨 Adding Textures to Your 3D Warehouse

You have **two main options** for adding textures to your 3D models:

## 🎯 **Option 1: Texture in Blender (Recommended)**

### **Pros:**
- ✅ Textures are baked into GLB files
- ✅ No additional web loading time
- ✅ Better control over UV mapping
- ✅ Smaller overall file sizes

### **Process:**
1. **Open your model in Blender**
2. **Create materials** with texture nodes
3. **Add texture maps** (diffuse, normal, roughness)
4. **Bake textures** into the materials
5. **Export as GLB** with textures embedded

### **Benefits:**
- Textures are part of the model file
- No network requests for texture files
- Professional workflow for production

---

## 🔧 **Option 2: Runtime Texture Loading (Flexible)**

### **Pros:**
- ✅ Easy to swap textures without re-exporting models
- ✅ Can load textures conditionally
- ✅ Great for testing different looks

### **Process:**
1. **Add texture files** to `/public/textures/` folder
2. **Use the texture loader** (already set up for you!)
3. **Textures apply automatically** when models load

### **Setup Already Done:**
I've created the texture loading system for you:
- `src/utils/textureLoader.ts` - Handles loading and caching
- Updated `Warehouse.tsx` - Applies textures automatically
- `/public/textures/README.md` - Full folder structure guide

---

## 📁 **Folder Structure** (For Option 2)

```
public/textures/
├── roof/
│   ├── roof_diffuse.jpg      # Base color
│   ├── roof_normal.jpg       # Bump details  
│   └── roof_roughness.jpg    # Shine/matte
├── panels/
│   ├── panels_diffuse.jpg
│   ├── panels_normal.jpg
│   └── panels_roughness.jpg
└── flooring/
    ├── flooring_diffuse.jpg
    ├── flooring_normal.jpg
    └── flooring_roughness.jpg
```

---

## 🚀 **Quick Start Guide**

### **For Beginners (Option 2):**
1. **Create folders:** Make the texture folders shown above
2. **Add images:** Drop your texture JPGs into the folders
3. **Restart server:** `npm run dev`
4. **Check console:** Look for texture loading messages

### **For Blender Users (Option 1):**
1. **Add materials** in Blender with Image Texture nodes
2. **Connect maps:** Diffuse→Base Color, Normal→Normal, etc.
3. **Export GLB:** File → Export → glTF 2.0 (.glb)
4. **Replace models:** Update your `/public/models/` files

---

## 🎨 **Getting Texture Files**

### **Free Sources:**
- **[Polyhaven](https://polyhaven.com/textures)** - High-quality PBR textures
- **[CC0 Textures](https://cc0textures.com/)** - Free commercial use
- **[Freepbr](https://freepbr.com/)** - PBR material library

### **Recommended Textures:**
- **Roof:** Metal roofing, shingles, tiles
- **Panels:** Siding, brick, concrete panels
- **Flooring:** Concrete, wood planks, industrial

---

## ⚡ **Performance Tips**

1. **Texture Size:** Use 1024×1024 for best balance
2. **Format:** JPG for most textures, PNG if transparency needed
3. **Compression:** Optimize images before uploading
4. **Caching:** Textures are cached automatically

---

## 🛠 **Already Set Up For You:**

The texture loading system is **ready to use**:
- ✅ Automatic texture loading
- ✅ Error handling and fallbacks  
- ✅ Performance optimization
- ✅ Easy file management

**Just add your texture files and they'll load automatically!**

---

## 🎯 **My Recommendation**

**Start with Option 2** (runtime loading) because:
- It's easier to experiment with different textures
- You can quickly test various looks
- No need to learn Blender workflows initially
- The system is already built for you

**Later upgrade to Option 1** when you:
- Have finalized your texture choices
- Want optimal performance
- Need more advanced material setups 