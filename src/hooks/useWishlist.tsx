import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    name: string;
    price: number;
    image_url: string;
  };
}

export const useWishlist = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

  const { data: wishlistItems, isLoading: isLoadingWishlist } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching wishlist items for user:', user.id);
      
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          product_id,
          product:products (
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching wishlist:', error);
        throw error;
      }

      console.log('Wishlist items fetched:', data);
      return data as WishlistItem[];
    },
    enabled: !!user,
  });

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des articles à votre wishlist",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToWishlist(true);
    try {
      console.log('Adding item to wishlist:', { productId });
      
      const { error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;

      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté à votre wishlist",
      });
      
      queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit à la wishlist",
        variant: "destructive",
      });
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    try {
      console.log('Removing item from wishlist:', wishlistItemId);
      
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistItemId);

      if (error) throw error;

      toast({
        title: "Produit retiré",
        description: "Le produit a été retiré de votre wishlist",
      });
      
      queryClient.invalidateQueries({ queryKey: ['wishlist', user.id] });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer le produit de la wishlist",
        variant: "destructive",
      });
    }
  };

  return {
    wishlistItems,
    isLoadingWishlist,
    isAddingToWishlist,
    addToWishlist,
    removeFromWishlist,
  };
};