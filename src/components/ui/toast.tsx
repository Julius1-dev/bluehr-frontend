import { useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

type ToastProps = {
  message: string;
  onClose: () => void;
};

export const Toast = ({ message, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center justify-between p-4 bg-green-100 border border-green-200 rounded-lg shadow-lg max-w-xs">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <span className="text-sm text-green-800">{message}</span>
      </div>
      <button 
        onClick={onClose}
        className="text-green-600 hover:text-green-800 focus:outline-none"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const useToast = () => {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState('');

  const showToast = (msg: string) => {
    setMessage(msg);
    setShow(true);
  };

  const ToastComponent = () => {
    if (!show) return null;
    return <Toast message={message} onClose={() => setShow(false)} />;
  };

  return { showToast, Toast: ToastComponent };
};
