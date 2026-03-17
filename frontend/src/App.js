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
import { NotificationProvider } from "./context/NotificationContext";
import SearchResults from "./pages/SearchResults";

const App = () => {
  return (
    <AuthContextProvider>
      <NotificationProvider>
        <div className="App">
        <BrowserRouter>
          <div className="pages">
            <Routes>
              <Route exact path="/" element={<LandingPage />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/home" element={<Home />} />
              <Route path="/materials" element={<Materials />} />
              <Route path="/messaging" element={<Messaging />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/mynetwork" element={<MyNetwork />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/search" element={<SearchResults />} />
            </Routes>
          </div>
        </BrowserRouter>
      </div>
      </NotificationProvider>
    </AuthContextProvider>
  );
};

export default App;
