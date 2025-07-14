import { Toaster } from 'sonner';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './AppRoutes';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <AppRoutes />
      </Router>
    </>
  );
}

export default App;