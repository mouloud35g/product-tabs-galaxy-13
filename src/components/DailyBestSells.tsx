import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TabSelector } from './daily-best-sells/TabSelector';
import { PromoSection } from './daily-best-sells/PromoSection';
import { ProductCarousel } from './daily-best-sells/ProductCarousel';

const tabs = [
  { id: 'featured', label: 'En vedette' },
  { id: 'popular', label: 'Populaire' },
  { id: 'new', label: 'Nouveautés' },
];

interface Product {
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

interface DailyBestSellsProps {
  products: Product[];
}

export const DailyBestSells = ({ products: initialProducts }: DailyBestSellsProps) => {
  const [activeTab, setActiveTab] = useState('featured');

  const { data: filteredProducts = [], isLoading } = useQuery({
    queryKey: ['products', activeTab],
    queryFn: async () => {
      console.log(`Fetching ${activeTab} products...`);
      let query = supabase
        .from('products')
        .select('*');

      switch (activeTab) {
        case 'featured':
          query = query.eq('is_featured', true);
          break;
        case 'popular':
          query = query
            .order('sold_count', { ascending: false })
            .limit(10);
          break;
        case 'new':
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          query = query
            .gte('created_at', sevenDaysAgo.toISOString())
            .order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error(`Error fetching ${activeTab} products:`, error);
        throw error;
      }

      console.log(`${activeTab} products fetched:`, data);
      return data || [];
    },
    initialData: initialProducts,
  });

  return (
    <section className="py-16 px-4 md:px-6 lg:px-8 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <motion.div 
        className="max-w-7xl mx-auto"
        initial="hidden"
        animate="show"
      >
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <PromoSection />
          </div>
          
          <div className="md:w-3/4">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <motion.h3 
                  className="text-2xl font-bold text-gray-800"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Meilleures ventes quotidiennes
                </motion.h3>
                <TabSelector 
                  tabs={tabs} 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab} 
                />
              </div>

              <ProductCarousel products={filteredProducts} />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};