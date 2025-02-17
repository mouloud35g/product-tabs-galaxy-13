import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  discount_percentage: number;
  start_date: string;
  end_date: string;
}

export const PromotionCarousel = () => {
  const { data: promotions = [] } = useQuery({
    queryKey: ['active-promotions'],
    queryFn: async () => {
      console.log('Fetching active promotions...');
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('active', true)
        .gte('end_date', now)
        .lte('start_date', now)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching promotions:', error);
        throw error;
      }

      console.log('Active promotions fetched:', data);
      return data || [];
    },
  });

  if (promotions.length === 0) return null;

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full"
    >
      <CarouselContent>
        {promotions.map((promo, index) => (
          <CarouselItem key={promo.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative h-[400px] bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 flex flex-col justify-center"
            >
              <div className="max-w-2xl">
                <h2 className="text-4xl font-bold mb-4">{promo.name}</h2>
                {promo.description && (
                  <p className="text-lg text-gray-600 mb-6">{promo.description}</p>
                )}
                <div className="text-3xl font-bold text-primary mb-8">
                  -{promo.discount_percentage}%
                </div>
                <Button className="group">
                  Voir l'offre
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};