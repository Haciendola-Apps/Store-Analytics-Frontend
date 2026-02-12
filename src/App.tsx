import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Overview } from './components/dashboard/Overview';
import { Stores } from './components/store/Stores';
import { Analytics } from './components/dashboard/Analytics';
import { QuickView } from './components/dashboard/QuickView';
import { DateRangeProvider } from './context/DateRangeContext';
import { SettingsProvider } from './context/SettingsContext';

import { AuthProvider } from './context/AuthContext';
import { Login } from './components/auth/Login';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SettingsProvider>
          <DateRangeProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Overview />} />
                        <Route path="/stores" element={<Stores />} />
                        <Route path="/products" element={<div className="p-4">Products Page (Coming Soon)</div>} />
                        <Route path="/customers" element={<div className="text-muted-foreground">Customers View (Coming Soon)</div>} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/quick-view" element={<QuickView />} />
                        <Route path="/settings" element={<div className="text-muted-foreground">Settings View (Coming Soon)</div>} />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </DateRangeProvider>
        </SettingsProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
