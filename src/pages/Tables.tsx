import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Loader2, ArrowUpDown, Package2, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ProductForm } from "@/components/products/ProductForm";
import { DeleteAlert } from "@/components/products/DeleteAlert";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type SortConfig = {
  column: string;
  direction: 'asc' | 'desc';
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock: number;
  image_url: string | null;
  created_at: string;
};

const Tables = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ column: 'name', direction: 'asc' });
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const itemsPerPage = 5;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (!session) {
        toast({
          variant: "destructive",
          title: "Accès refusé",
          description: "Vous devez être connecté pour accéder à cette page.",
        });
        navigate("/login");
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products", sortConfig],
    queryFn: async () => {
      console.log("Fetching products with sort config:", sortConfig);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order(sortConfig.column, { ascending: sortConfig.direction === 'asc' });
      
      if (error) {
        console.error("Error fetching products:", error);
        throw error;
      }
      return data as Product[];
    },
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  const createProduct = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from('products')
        .insert([{
          name: values.name,
          description: values.description || null,
          price: Number(values.price),
          category: values.category,
          stock: Number(values.stock),
          image_url: values.image_url || null,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsSheetOpen(false);
      toast({
        title: "Succès",
        description: "Le produit a été créé avec succès.",
      });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: any }) => {
      const { error } = await supabase
        .from('products')
        .update({
          name: values.name,
          description: values.description || null,
          price: Number(values.price),
          category: values.category,
          stock: Number(values.stock),
          image_url: values.image_url || null,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsSheetOpen(false);
      setSelectedProduct(null);
      toast({
        title: "Succès",
        description: "Le produit a été mis à jour avec succès.",
      });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteProductId(null);
      toast({
        title: "Succès",
        description: "Le produit a été supprimé avec succès.",
      });
    },
  });

  if (!isAuthenticated) {
    return null; // Don't render anything while checking authentication
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg font-medium text-red-600">
          Erreur lors du chargement des produits. Veuillez réessayer.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-lg font-medium text-muted-foreground">Chargement des produits...</p>
      </div>
    );
  }

  const totalPages = products ? Math.ceil(products.length / itemsPerPage) : 0;
  const paginatedProducts = products?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (column: string) => {
    setSortConfig(current => ({
      column,
      direction: current.column === column && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStockColor = (stock: number) => {
    if (stock > 50) return 'text-green-600';
    if (stock > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsSheetOpen(true);
  };

  const handleFormSubmit = async (values: any) => {
    if (selectedProduct) {
      await updateProduct.mutateAsync({ id: selectedProduct.id, values });
    } else {
      await createProduct.mutateAsync(values);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Package2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Tableau des Produits</h1>
        </div>
        <Button onClick={() => {
          setSelectedProduct(null);
          setIsSheetOpen(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Produit
        </Button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-lg border shadow-sm bg-card"
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50 transition-colors">
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('name')}
                  className="hover:bg-muted/50 -ml-4 font-semibold"
                >
                  Nom
                  <ArrowUpDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                    sortConfig.column === 'name' ? 'text-primary' : ''
                  }`} />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('category')}
                  className="hover:bg-muted/50 -ml-4 font-semibold"
                >
                  Catégorie
                  <ArrowUpDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                    sortConfig.column === 'category' ? 'text-primary' : ''
                  }`} />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('price')}
                  className="hover:bg-muted/50 -ml-4 font-semibold"
                >
                  Prix
                  <ArrowUpDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                    sortConfig.column === 'price' ? 'text-primary' : ''
                  }`} />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('stock')}
                  className="hover:bg-muted/50 -ml-4 font-semibold"
                >
                  Stock
                  <ArrowUpDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                    sortConfig.column === 'stock' ? 'text-primary' : ''
                  }`} />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort('created_at')}
                  className="hover:bg-muted/50 -ml-4 font-semibold"
                >
                  Date de création
                  <ArrowUpDown className={`ml-2 h-4 w-4 transition-transform duration-200 ${
                    sortConfig.column === 'created_at' ? 'text-primary' : ''
                  }`} />
                </Button>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedProducts?.map((product) => (
              <TableRow 
                key={product.id} 
                className="hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-sm">
                    {product.category}
                  </span>
                </TableCell>
                <TableCell className="font-mono">{formatPrice(product.price)}</TableCell>
                <TableCell>
                  <span className={`font-medium ${getStockColor(product.stock)}`}>
                    {product.stock}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(product.created_at)}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteProductId(product.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>

      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className={`${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} transition-opacity`}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i + 1}>
              <PaginationLink
                onClick={() => setCurrentPage(i + 1)}
                isActive={currentPage === i + 1}
                className="cursor-pointer transition-colors"
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className={`${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} transition-opacity`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {selectedProduct ? "Modifier le produit" : "Nouveau produit"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <ProductForm
              initialData={selectedProduct || undefined}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setIsSheetOpen(false);
                setSelectedProduct(null);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <DeleteAlert
        isOpen={!!deleteProductId}
        onConfirm={() => {
          if (deleteProductId) {
            deleteProduct.mutateAsync(deleteProductId);
          }
        }}
        onCancel={() => setDeleteProductId(null)}
      />
    </div>
  );
};

export default Tables;
