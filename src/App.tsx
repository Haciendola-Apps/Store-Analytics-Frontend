import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Overview } from './components/dashboard/Overview';
import { Stores } from './components/store/Stores';
import { Analytics } from './components/dashboard/Analytics';
import { DateRangeProvider } from './context/DateRangeContext';

function App() {
  return (
    <Router>
      <DateRangeProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/products" element={<div className="p-4">Products Page (Coming Soon)</div>} />
            <Route path="/customers" element={<div className="text-muted-foreground">Customers View (Coming Soon)</div>} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<div className="text-muted-foreground">Settings View (Coming Soon)</div>} />
          </Routes>
        </Layout>
      </DateRangeProvider>
    </Router>
  );
}

export default App;
