import { Link, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";

const Navigation = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <Shield className="h-6 w-6 text-primary" />
            <span>TruthGuard</span>
          </Link>
          
          <div className="flex gap-6">
            <Link 
              to="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/detect" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/detect') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Detect
            </Link>
            <Link 
              to="/features" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/features') ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              Features
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
