import type { Product, MainCategory } from "../types/Product";

/**
 * Transforms a flat array of Products from db.json into a structured category tree.
 * Automatically resolves both 'id' properties and maps category display images safely.
 * * @param products - Array of raw Product data from db.json
 * @returns Array of MainCategory structured trees matching your exact types
 */
export function buildCategoryTree(products: Product[]): MainCategory[] {
  const tree: Record<string, Record<string, Record<string, Set<string>>>> = {};
  const mainCatImages: Record<string, string> = {};

  products.forEach((product) => {
    const cats = product.categories || [];

    // Safely parse deep categories with fallback values if strings are missing
    const main = cats[0] || "General";
    const sub = cats[1] || "Other";
    const group = cats[2] || "Products";
    const brand = product.brand || "Generic";

    // Grab the first valid product image for the top-level main category banner
    if (
      !mainCatImages[main] &&
      product.images &&
      product.images.length > 0 &&
      product.images[0]
    ) {
      mainCatImages[main] = product.images[0];
    }

    // Initialize nested tree objects on the fly
    if (!tree[main]) tree[main] = {};
    if (!tree[main][sub]) tree[main][sub] = {};
    if (!tree[main][sub][group]) tree[main][sub][group] = new Set<string>();

    // Using a Set avoids adding duplicate brand names to a specific sub-group list
    tree[main][sub][group].add(brand);
  });

  // Construct the finalized typed MainCategory array schema mapping
  return Object.keys(tree).map((mainKey) => ({
    // Generates required unique identifier string for Main Category
    id: mainKey.toLowerCase().trim().replace(/\s+/g, "-"),
    title: mainKey,
    imageUrl:
      mainCatImages[mainKey] ||
      "https://via.placeholder.com/400x300?text=No+Image",
    subCategories: Object.keys(tree[mainKey]).map((subKey) => ({
      // FIX: Generates required unique identifier string for Sub Category
      id: `${mainKey.toLowerCase()}-${subKey.toLowerCase()}`
        .trim()
        .replace(/\s+/g, "-"),
      title: subKey,
      groups: Object.keys(tree[mainKey][subKey]).map((groupKey) => ({
        title: groupKey,
        items: Array.from(tree[mainKey][subKey][groupKey]).map((brandName) => ({
          name: brandName,
          // Builds clean dynamic search string matrices
          path: `/search?category=${encodeURIComponent(groupKey)}&brand=${encodeURIComponent(brandName)}`,
        })),
      })),
    })),
  }));
}
