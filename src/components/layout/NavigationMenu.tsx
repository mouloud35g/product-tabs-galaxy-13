
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Menu, Star } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";

export function MainNav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-4 w-[200px]">
                  <li>
                    <NavigationMenuLink
                      className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        "cursor-pointer"
                      )}
                      onClick={() => navigate("/")}
                    >
                      <div className="text-sm font-medium leading-none">Accueil</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Retour à la page d'accueil
                      </p>
                    </NavigationMenuLink>
                  </li>
                  <li>
                    <NavigationMenuLink
                      className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        "cursor-pointer"
                      )}
                      onClick={() => navigate("/reviews")}
                    >
                      <div className="text-sm font-medium leading-none">Avis Clients</div>
                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        Voir les avis et commentaires
                      </p>
                    </NavigationMenuLink>
                  </li>
                  {user && (
                    <li>
                      <NavigationMenuLink
                        className={cn(
                          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                          "cursor-pointer"
                        )}
                        onClick={() => navigate("/admin")}
                      >
                        <div className="text-sm font-medium leading-none">Administration</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Gérer le site
                        </p>
                      </NavigationMenuLink>
                    </li>
                  )}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/reviews")}
          >
            <Star className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/wishlist")}
          >
            <Heart className="h-4 w-4" />
          </Button>
          <CartDrawer />
          {user ? (
            <Button
              variant="outline"
              onClick={() => signOut()}
            >
              Déconnexion
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
            >
              Connexion
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
