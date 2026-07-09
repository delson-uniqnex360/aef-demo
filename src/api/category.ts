import type { Product, MainCategory } from "../types/Product";

/**
 * Transforms a flat array of Products from db.json into a structured category tree.
 * Groups products by Brand while preserving the first product's SKU.
 */
export function buildCategoryTree(products: Product[]): MainCategory[] {
  const tree: Record<string, Record<string, Record<string, Product[]>>> = {};
  const mainCatImages: Record<string, string> = {};

  products.forEach((product) => {
    const cats = product.categories || [];

    const main = cats[0] || "General";
    const sub = cats[1] || "Other";
    const group = cats[2] || "Products";

    if (
      !mainCatImages[main] &&
      product.images &&
      product.images.length > 0 &&
      product.images[0]
    ) {
      mainCatImages[main] = product.images[0];
    }

    if (!tree[main]) tree[main] = {};
    if (!tree[main][sub]) tree[main][sub] = {};
    if (!tree[main][sub][group]) tree[main][sub][group] = [];

    tree[main][sub][group].push(product);
  });

  return Object.keys(tree).map((mainKey) => ({
    id: mainKey.toLowerCase().trim().replace(/\s+/g, "-"),
    title: mainKey,
    imageUrl:
      mainCatImages[mainKey] ||
      "https://via.placeholder.com/400x300?text=No+Image",

    subCategories: Object.keys(tree[mainKey]).map((subKey) => ({
      id: `${mainKey.toLowerCase()}-${subKey.toLowerCase()}`
        .trim()
        .replace(/\s+/g, "-"),

      title: subKey,

      groups: Object.keys(tree[mainKey][subKey]).map((groupKey) => {
        const allProductsInGroup = tree[mainKey][subKey][groupKey];

        const uniqueBrands = Array.from(
          new Set(allProductsInGroup.map((p) => p.brand || "Generic")),
        );

        const brandItems = uniqueBrands.map((brandName) => {
          const brandProducts = allProductsInGroup.filter(
            (p) => (p.brand || "Generic") === brandName,
          );

          const firstProduct = brandProducts[0];

          const brandImages: string[] = [];

          brandProducts.forEach((p) => {
            if (p.images?.length) {
              brandImages.push(...p.images);
            }
          });

          return {
            id: `${groupKey.toLowerCase()}-${brandName.toLowerCase()}`
              .trim()
              .replace(/\s+/g, "-"),

            // <-- ADD THIS
            sku: firstProduct?.sku,

            name: brandName,
            brand: brandName,

            images: brandImages,

            path: `/search?category=${encodeURIComponent(
              groupKey,
            )}&brand=${encodeURIComponent(brandName)}`,
          };
        });

        return {
          id: `${mainKey.toLowerCase()}-${subKey.toLowerCase()}-${groupKey.toLowerCase()}`
            .trim()
            .replace(/\s+/g, "-"),

          title: groupKey,

          items: brandItems,
        };
      }),
    })),
  }));
}
