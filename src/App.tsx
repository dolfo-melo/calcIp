import { AppProvider } from './context/AppContext';
import LandingPage from './components/Landing/LandingPage';
import './index.css';

export default function App() {
  return (
    <AppProvider>
      <div className="bg-term-black font-mono">
        <LandingPage />
      </div>
    </AppProvider>
  );
}
