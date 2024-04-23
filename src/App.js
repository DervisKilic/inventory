import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import React from "react";
import Login from "./views/login"; // Make sure the path is correctly specified
import InventoryList from "./views/inventoryList";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate replace to="/inventory" />} />
        <Route path="/inventory" element={<InventoryList />} />
      </Routes>
    </Router>
  );
}

export default App;
