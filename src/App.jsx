import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Tree from './components/Tree';
import QuickSearch from './components/QuickSearch';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Tree />} />
          <Route path="/search" element={<QuickSearch />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
