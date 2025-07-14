
import { Button } from './button';
import { Shield, User } from 'lucide-react';

interface AdminToggleProps {
  isAdmin: boolean;
  onToggle: () => void;
}

export function AdminToggle({ isAdmin, onToggle }: AdminToggleProps): JSX.Element {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`fixed bottom-4 right-4 z-50 ${isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}
      onClick={onToggle}
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
