import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import PostItem from "./pages/PostItem";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import Navbar from "./components/Navbar"; 
import Admin from './pages/Admin';
import MyItems from './pages/MyItems'; 
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <Router>
      <Navbar />
      
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/post" element={<PostItem />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/my-items" element={<MyItems />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;