import React, { useState } from "react";
import "./App.css";
import Navbar from "./Components/Navbar/Navbar";
import MapboxExample from "./Components/Mapbox/Mapbox";
import "primereact/resources/themes/lara-light-indigo/theme.css"; //theme
import "primereact/resources/primereact.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import { DialogProvider } from "./Context/DialogContext";
import { AppProvider, useAppContext } from "./Context/AppContext"; // import useAppContext
import { ToastProvider } from "./Context/ToastContext";
import CustomDialog from "./Components/Dialog/Dialog";
import DropdownElements from "./Components/DropdownElements/DropdownElements";
import BBOXSelector from "./Components/tools/BBOXSelector/BBOXSelector";
import BboxValues from "./Components/tools/BBOXValues/BboxValues";

function App() {
  return (
    <AppProvider>
      <DialogProvider>
        <ToastProvider>
          <Navbar />
          <CustomDialog />
          <div className="content">
            <MapboxExample />
            <ConditionalDropdown />
            <ConditionalSelector />
          </div>
        </ToastProvider>
      </DialogProvider>
    </AppProvider>
  );
}

function ConditionalDropdown() {
  const { networkElementsDropdown } = useAppContext();

  return networkElementsDropdown ? <DropdownElements /> : null;
}
function ConditionalSelector() {
  const { bboxSelectorVisible } = useAppContext();
  return bboxSelectorVisible ? [<BBOXSelector />, <BboxValues />] : null;
}

export default App;
