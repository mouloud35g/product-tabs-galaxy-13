
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { Progress } from "@/components/ui/progress";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  sold_count: number | null;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isAddingToCart } = useCart();
  const { addToWishlist, isAddingToWishlist } = useWishlist();
  const soldPercentage = ((product.sold_count || 0) / (product.stock || 1)) * 100;

  return (
    <div className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square relative">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        <p className="text-gray-600 mb-4">${product.price.toFixed(2)}</p>
        {product.sold_count !== null && (
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Vendus: {product.sold_count}</span>
              <span>Stock: {product.stock}</span>
            </div>
            <Progress value={soldPercentage} className="h-2" />
          </div>
        )}
        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={() => addToCart(product.id)}
            disabled={isAddingToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            <span>Ajouter au panier</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => addToWishlist(product.id)}
            disabled={isAddingToWishlist}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
