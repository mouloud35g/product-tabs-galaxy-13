import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    name: string;
    price: number;
    image_url: string;
  };
}

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Configurer l'écoute des changements en temps réel
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for cart items...');
    
    const channel = supabase
      .channel('cart-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Cart change detected:', payload);
          // Invalider le cache pour forcer un re-fetch
          queryClient.invalidateQueries({ queryKey: ['cart', user.id] });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      console.log('Cleaning up realtime subscription...');
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const { data: cartItems, isLoading: isLoadingCart } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching cart items for user:', user.id);
      
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          product:products (
            name,
            price,
            image_url
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching cart:', error);
        throw error;
      }

      console.log('Cart items fetched:', data);
      return data as CartItem[];
    },
    enabled: !!user,
  });

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter des articles au panier",
        variant: "destructive",
      });
      return;
    }

    setIsAddingToCart(true);
    try {
      console.log('Adding item to cart:', { productId, quantity });
      
      // Vérifier si l'article existe déjà dans le panier
      const { data: existingItem, error: fetchError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (existingItem) {
        console.log('Updating existing cart item:', existingItem);
        
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        console.log('Creating new cart item');
        
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          });

        if (error) throw error;
      }

      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté à votre panier",
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit au panier",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      console.log('Updating cart item quantity:', { cartItemId, quantity });
      
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', cartItemId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la quantité",
        variant: "destructive",
      });
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      console.log('Removing item from cart:', cartItemId);
      
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId);

      if (error) throw error;

      toast({
        title: "Produit retiré",
        description: "Le produit a été retiré de votre panier",
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Erreur",
        description: "Impossible de retirer le produit du panier",
        variant: "destructive",
      });
    }
  };

  const cartTotal = cartItems?.reduce((total, item) => {
    return total + (item.product.price * item.quantity);
  }, 0) ?? 0;

  const cartItemsCount = cartItems?.reduce((total, item) => {
    return total + item.quantity;
  }, 0) ?? 0;

  return {
    cartItems,
    isLoadingCart,
    isAddingToCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    cartTotal,
    cartItemsCount,
  };
};