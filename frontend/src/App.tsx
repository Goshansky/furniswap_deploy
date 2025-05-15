import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Profile from "./pages/Profile/Profile";
import Login from "./auth/Login";
import Register from "./auth/Register";
import Verify from "./auth/Verify";
import Verify2fa from "./auth/Verify2fa";
import Catalog from "./pages/Catalog/Catalog";
import Product from "./pages/Product/Product";
import Chat from "./pages/Chat/Chat";
import Favorites from "./pages/Favorites/Favorites";
import CreateListing from "./pages/CreateListing/CreateListing";
import EditListing from "./pages/EditListing/EditListing";
import InspirationDesign from "./pages/InspirationDesign/InspirationDesign";
import Purchases from "./pages/Purchases/Purchases";
import Sales from "./pages/Sales/Sales";
import Terms from "./pages/Terms/Terms";
import Privacy from "./pages/Privacy/Privacy";
import Contact from "./pages/Contact/Contact";

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/verify2fa" element={<Verify2fa />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/chats" element={<Chat />} />
                <Route path="/chats/:id" element={<Chat />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/create-listing" element={<CreateListing />} />
                <Route path="/edit-listing/:id" element={<EditListing />} />
                <Route path="/inspiration" element={<InspirationDesign />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/contact" element={<Contact />} />
            </Routes>
        </Router>
    );
};

export default App;
