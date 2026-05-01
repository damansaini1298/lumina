import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Language from './pages/Language';
import Dictation from './pages/Dictation';
import MathBlock from './pages/Math';
import Pro from './pages/Pro';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="language" element={<Language />} />
            <Route path="dictation" element={<Dictation />} />
            <Route path="math" element={<MathBlock />} />
            <Route path="pro" element={<Pro />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}
