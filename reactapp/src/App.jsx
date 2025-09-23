import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Users from "./Users";
import PaymentPage from "./PaymentPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/users" element={<Users />} />
        <Route path="/payment" element={<PaymentPage />} /> 
      </Routes>
    </Router>
  );
}
export default App;