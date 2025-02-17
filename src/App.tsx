
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthGuard } from "@/components/AuthGuard";
import { AdminLayout } from "@/components/layout/AdminLayout";

// Pages
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Admin from "@/pages/Admin";
import Tables from "@/pages/Tables";
import Wishlist from "@/pages/Wishlist";
import Reviews from "@/pages/Reviews";

// Admin Pages
import Products from "@/pages/admin/Products";
import Categories from "@/pages/admin/Categories";
import UsersManagement from "@/pages/admin/UsersManagement";
import OrdersManagement from "@/pages/admin/OrdersManagement";
import ReviewsManagement from "@/pages/admin/ReviewsManagement";
import ShippingManagement from "@/pages/admin/ShippingManagement";
import Newsletter from "@/pages/admin/Newsletter";
import Settings from "@/pages/admin/Settings";
import Statistics from "@/pages/admin/Statistics";
import Promotions from "@/pages/admin/Promotions";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/reviews" element={<Reviews />} />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AuthGuard>
              <AdminLayout>
                <Admin />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AuthGuard>
              <AdminLayout>
                <Products />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AuthGuard>
              <AdminLayout>
                <Categories />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AuthGuard>
              <AdminLayout>
                <UsersManagement />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AuthGuard>
              <AdminLayout>
                <OrdersManagement />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <AuthGuard>
              <AdminLayout>
                <ReviewsManagement />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/shipping"
          element={
            <AuthGuard>
              <AdminLayout>
                <ShippingManagement />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/newsletter"
          element={
            <AuthGuard>
              <AdminLayout>
                <Newsletter />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AuthGuard>
              <AdminLayout>
                <Settings />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/statistics"
          element={
            <AuthGuard>
              <AdminLayout>
                <Statistics />
              </AdminLayout>
            </AuthGuard>
          }
        />
        <Route
          path="/admin/promotions"
          element={
            <AuthGuard>
              <AdminLayout>
                <Promotions />
              </AdminLayout>
            </AuthGuard>
          }
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
