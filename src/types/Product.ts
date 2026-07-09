export type ProductAttribute = {
  name: string;
  value: string | null;
  uom: string | null;
};

export type Product = {
  sku: string;
  product_name: string;
  brand: string;
  mpn: string;

  categories: string[];
  taxonomy: string;

  weight: string;
  weight_unit: string;
  currency: string;

  images: string[];

  long_description: string;

  features: string[];

  attributes: ProductAttribute[];
};

export type MenuItem = {
  name: string;
  path: string;
};

export type MenuGroup = {
  title: string;
  items: MenuItem[];
};

export type SubCategory = {
  id: string;
  title: string;
  groups: MenuGroup[];
};

export type MainCategory = {
  id: string;
  title: string;
  subCategories: SubCategory[];
};
