import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Contact from './pages/Contact';
import AdminLayout from './pages/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import AdminDestinations from './pages/admin/Destinations';
import AdminPackages from './pages/admin/Packages';
import AdminBookings from './pages/admin/Bookings';
import AdminMessages from './pages/admin/Messages';
import AdminUsers from './pages/admin/Users';

export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="destinations" element={<AdminDestinations />} />
            <Route path="packages" element={<AdminPackages />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </>
  );
}
