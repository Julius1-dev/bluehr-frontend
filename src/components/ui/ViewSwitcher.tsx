import { useNavigate } from 'react-router-dom';
import { Button } from './button';
import { Shield, User } from 'lucide-react';

interface ViewSwitcherProps {
  isAdmin: boolean;
  onToggle: () => void;
}

export function ViewSwitcher({ isAdmin, onToggle }: ViewSwitcherProps): JSX.Element | null {
  const navigate = useNavigate();
  
  // Hide for super admin
  if (window.location.pathname.startsWith('/super-admin')) return null;

  const handleToggle = () => {
    onToggle();
    // Navigate after state change
    if (isAdmin) {
      navigate('/');
    } else {
      navigate('/admin');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`fixed bottom-4 right-4 z-50 ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}
      onClick={handleToggle}
    >
      {isAdmin ? (
        <>
          <User className="mr-2 h-4 w-4" />
          Switch to Employee View
        </>
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4" />
          Switch to Admin View
        </>
      )}
    </Button>
  );
}
