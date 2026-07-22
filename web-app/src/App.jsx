import { Routes, Route } from 'react-router-dom';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CarBikeFeed from './pages/CarBikeFeed';
import PostDetail from './pages/PostDetail';
import CreatePost from './pages/CreatePost';
import Marketplace from './pages/Marketplace';
import ListingDetail from './pages/ListingDetail';
import TravelBlog from './pages/TravelBlog';
import TravelPostDetail from './pages/TravelPostDetail';
import TourGuide from './pages/TourGuide';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Kyc from './pages/Kyc';
import Search from './pages/Search';
import NotFound from './pages/NotFound';

/*
 * App shell — persistent Navbar/Footer with the routed page in between.
 * Public routes are open; CreatePost and Profile require authentication.
 */
export default function App() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Pillar 1: Cars & Bikes posts */}
          <Route path="/feed" element={<CarBikeFeed />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />

          {/* Pillar 4: Marketplace */}
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<ListingDetail />} />

          {/* Pillar 2: Travel */}
          <Route path="/travel" element={<TravelBlog />} />
          <Route path="/travel/:id" element={<TravelPostDetail />} />
          <Route path="/tour-guide" element={<TourGuide />} />

          {/* Pillar 3: Community */}
          <Route path="/community" element={<Community />} />

          {/* Discovery: global search */}
          <Route path="/search" element={<Search />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Buyer/Seller KYC */}
          <Route
            path="/kyc"
            element={
              <ProtectedRoute>
                <Kyc />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
