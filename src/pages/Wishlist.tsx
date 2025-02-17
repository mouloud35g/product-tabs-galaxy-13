import { Heart, Loader2, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const Wishlist = () => {
  const { wishlistItems, isLoadingWishlist, removeFromWishlist } = useWishlist();
  const { addToCart, isAddingToCart } = useCart();

  if (isLoadingWishlist) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Ma Wishlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-[200px] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!wishlistItems?.length) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Ma Wishlist</h1>
        <div className="text-center py-12">
          <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">Votre wishlist est vide</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Ma Wishlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlistItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-square relative">
              <img
                src={item.product.image_url || "/placeholder.svg"}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{item.product.name}</h3>
              <p className="text-gray-600 mb-4">${item.product.price.toFixed(2)}</p>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => addToCart(item.product_id)}
                  disabled={isAddingToCart}
                >
                  {isAddingToCart ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      <span>Ajouter au panier</span>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeFromWishlist(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;