import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <p className="text-8xl font-bold text-muted-foreground/30">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Button asChild className="gap-2 mt-2">
        <Link to="/"><Home className="w-4 h-4" /> Go Home</Link>
      </Button>
    </div>
  );
}
