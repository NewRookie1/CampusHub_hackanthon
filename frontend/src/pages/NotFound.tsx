import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import GlassButton from '../components/GlassButton';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-gradient mb-4">404</div>
        <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
        <p className="text-white/40 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <GlassButton variant="primary">
              <Home className="w-4 h-4 mr-2 inline" /> Go Home
            </GlassButton>
          </Link>
          <button onClick={() => navigate(-1)}>
            <GlassButton variant="glass">
              <ArrowLeft className="w-4 h-4 mr-2 inline" /> Go Back
            </GlassButton>
          </button>
        </div>
      </div>
    </div>
  );
}
