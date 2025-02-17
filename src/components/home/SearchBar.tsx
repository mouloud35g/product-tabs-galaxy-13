import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  category: string;
}

export const SearchBar = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const { data: products = [] } = useQuery({
    queryKey: ['search-products', search],
    queryFn: async () => {
      if (!search) return [];
      
      console.log('Searching products:', search);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category')
        .ilike('name', `%${search}%`)
        .limit(5);

      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      console.log('Search results:', data);
      return data || [];
    },
    enabled: search.length > 0,
  });

  return (
    <div className="relative max-w-xl mx-auto">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un produit..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandList>
              <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
              <CommandGroup heading="Produits">
                {products.map((product) => (
                  <CommandItem
                    key={product.id}
                    onSelect={() => {
                      navigate(`/product/${product.id}`);
                      setOpen(false);
                    }}
                  >
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {product.category}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};