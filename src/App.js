import react, { useState } from "react";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard"

import "./App.css";

const App = (props) => {
  return (
    <div className="App">
      <Header />
      <Dashboard />
    </div>
  );
};

export default App;