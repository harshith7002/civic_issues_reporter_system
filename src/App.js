import React from "react";
import Navbar from "./components/navbar";
import AppRoutes from "./routes/AppRoutes";
import "./styles/global.css";

function App() {
  return (
    <>
      <Navbar />
      {/* We removed <Router> from here because it's already in index.js */}
      <main className="app-container">
        <AppRoutes />
      </main>
    </>
  );
}

export default App;
