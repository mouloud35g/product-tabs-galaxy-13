
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ProductShowcase } from "@/components/ProductShowcase";
import { DailyBestSells } from "@/components/DailyBestSells";
import { PromotionCarousel } from "@/components/home/PromotionCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { SearchBar } from "@/components/home/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { MainNav } from "@/components/layout/NavigationMenu";

const Index = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      console.log('Fetching products...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      console.log('Products fetched:', data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <MainNav />
        <div className="container mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNav />
      <div className="container mx-auto px-4 py-8 space-y-12">
        <div className="mb-8">
          <SearchBar />
        </div>

        <section>
          <PromotionCarousel />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Catégories populaires</h2>
          <CategoryGrid />
        </section>

        <ProductShowcase products={products || []} />
        <DailyBestSells products={products || []} />
      </div>
    </div>
  );
};

export default Index;
