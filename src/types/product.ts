export interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  created_at: string;
  sold_count: number | null;
  view_count: number | null;
  is_featured: boolean | null;
}