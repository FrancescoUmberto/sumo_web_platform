import React, { useState } from "react";
import "./App.css";
import Navbar from "./Components/Navbar";
import MapboxExample from "./Components/Mapbox";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import Home from "./Pages/Home";
import OSMtools from "./tools/osm_tools";
import { DialogProvider } from "./Context/DialogContext";
import { AppProvider, useAppContext } from "./Context/AppContext"; // import useAppContext
import CustomDialog from "./Components/Dialog";
import DropdownElements from "./Components/DropdownElements";

function App() {
  const [currentPage, setCurrentPage] = useState("home"); // State for the current page
  const handlePageChange = (pageName) => {
    setCurrentPage(pageName); // Set the current page based on the page name passed from Navbar
  };

  return (
    <AppProvider>
      <DialogProvider>
        <Navbar onPageChange={handlePageChange} />
        <CustomDialog />
        <div className="content">
          <MapboxExample />
          <ConditionalDropdown />
          {currentPage === "home" && <Home />}
          {currentPage === "osm-tools" && <OSMtools />}
          {/* Add other pages here */}
        </div>
      </DialogProvider>
    </AppProvider>
  );
}

function ConditionalDropdown() {
  const { networkElementsDropdown } = useAppContext();

  return networkElementsDropdown ? <DropdownElements /> : null;
}

export default App;
