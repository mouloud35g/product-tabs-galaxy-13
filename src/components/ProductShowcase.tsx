import { useState } from 'react';
import { Heart, Shuffle, Eye, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Product {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  created_at: string;
}

interface ProductShowcaseProps {
  products: Product[];
}

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { user } = useAuth();
  const { wishlistItems, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  
  const isInWishlist = wishlistItems?.some(item => item.product_id === product.id);

  const handleWishlistClick = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des articles à votre wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isInWishlist) {
        const wishlistItem = wishlistItems?.find(item => item.product_id === product.id);
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.id);
          toast({
            title: "Produit retiré",
            description: "Le produit a été retiré de votre wishlist",
          });
        }
      } else {
        await addToWishlist(product.id);
        toast({
          title: "Produit ajouté",
          description: "Le produit a été ajouté à votre wishlist",
        });
      }
    } catch (error) {
      console.error('Error managing wishlist:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la gestion de la wishlist",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative overflow-hidden group">
        <img 
          src={product.image_url || '/placeholder.svg'} 
          alt={product.name}
          className="w-full h-64 object-cover transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={handleWishlistClick}
            className={cn(
              "p-2 rounded-full transition-colors",
              isInWishlist 
                ? "bg-primary text-white hover:bg-primary/90" 
                : "bg-white hover:bg-primary hover:text-white"
            )}
          >
            <Heart className={cn("w-5 h-5", isInWishlist ? "fill-current" : "")} />
          </button>
          <button className="p-2 bg-white rounded-full hover:bg-primary hover:text-white transition-colors">
            <Shuffle className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white rounded-full hover:bg-primary hover:text-white transition-colors">
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="text-sm text-gray-500 mb-1">{product.category}</div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
        <div className="text-sm text-gray-500 mb-3">{product.description}</div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-primary">${product.price}</span>
          <button className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductShowcase = ({ products }: ProductShowcaseProps) => {
  const [activeTab, setActiveTab] = useState('all');

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      console.log('Fetching categories...');
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      console.log('Categories fetched:', data);
      return data || [];
    },
  });

  const allCategory = { id: 'all', name: 'All', description: null };
  const availableCategories = categories ? [allCategory, ...categories] : [allCategory];

  const filteredProducts = activeTab === 'all' 
    ? products 
    : products.filter(product => {
        const category = categories?.find(cat => cat.name.toLowerCase() === product.category.toLowerCase());
        return category?.id === activeTab;
      });

  return (
    <section className="py-12 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-6">Popular Products</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {availableCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={cn(
                  "px-4 py-2 rounded-full transition-colors",
                  activeTab === category.id
                    ? "bg-primary text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};