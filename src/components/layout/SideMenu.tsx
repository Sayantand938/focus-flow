import {
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User as UserIcon,
  ClipboardList,
  X,
  ListTodo,
  Target, // Import the new icon
} from "lucide-react";
import { cn } from "@/utils/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import { User } from "firebase/auth";

const menuItems = [
  { name: "Focus Sheet", icon: ClipboardList, path: "focus-sheet" },
  { name: "Dashboard", icon: LayoutDashboard, path: "dashboard" },
  { name: "Todo List", icon: ListTodo, path: "todo-list" },
  { name: "Settings", icon: Settings, path: "settings" },
];

type SideMenuProps = {
  activePage: string;
  setActivePage: (page: string) => void;
  user: User | null;
  onSignOut: () => void;
};

function SideMenu({ activePage, setActivePage, user, onSignOut }: SideMenuProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handlePageChange = (page: string) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
  };

  const pageTitle = activePage.replace("-", " ");

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-4 border-b border-border bg-background/90 px-4 backdrop-blur-sm pt-12 pb-2">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -ml-2"
          aria-label="Open menu"
        >
          <Menu />
        </button>
        <h1 className="text-lg font-semibold capitalize tracking-tight">{pageTitle}</h1>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "w-64 flex-shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-4 flex flex-col",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0 md:z-auto"
        )}
      >
        {/* Header with Close button for Mobile */}
        <div className="flex items-center justify-between p-2 mb-8">
          <div className="flex items-center gap-3">
            {/* The new Target icon from Lucide */}
            <Target className="size-8 text-primary" />
            <h1 className="text-xl font-bold">Focus Flow</h1>
          </div>
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-grow">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handlePageChange(item.path)}
              className={cn(
                "flex items-center text-left gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full",
                activePage === item.path
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Footer - User Profile and Sign Out */}
        {user && (
          <footer className="mt-auto border-t border-sidebar-border pt-4">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="size-10 rounded-full"
                />
              ) : (
                <div className="size-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                  <UserIcon className="size-5 text-sidebar-accent-foreground" />
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">{user.displayName || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onSignOut}
                className="shrink-0"
                aria-label="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </footer>
        )}
      </aside>

      {/* Overlay for Mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}
export default SideMenu;