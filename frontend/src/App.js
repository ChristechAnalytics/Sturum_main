import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Materials from "./pages/Materials";
import Messaging from "./pages/Messaging";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import MyNetwork from "./pages/MyNetwork";
import Discover from "./pages/Discover";
import Settings from "./pages/Settings";
import { AuthContextProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { NotificationProvider } from "./context/NotificationContext";
import SearchResults from "./pages/SearchResults";
import ProtectedRoute from "./ProtectedRoute";
import { useTokenRefresh } from "./hooks/useTokenRefresh";

const AppRoutes = () => {
  useTokenRefresh();

  return (
    <BrowserRouter>
      <div className="pages">
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/materials"
            element={
              <ProtectedRoute>
                <Materials />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messaging"
            element={
              <ProtectedRoute>
                <Messaging />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mynetwork"
            element={
              <ProtectedRoute>
                <MyNetwork />
              </ProtectedRoute>
            }
          />
          <Route
            path="/discover"
            element={
              <ProtectedRoute>
                <Discover />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchResults />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <AuthContextProvider>
      <SocketProvider>
        <NotificationProvider>
          <div className="App">
            <AppRoutes />
          </div>
        </NotificationProvider>
      </SocketProvider>
    </AuthContextProvider>
  );
};

export default App;
