import React, { useState, createContext, useContext } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [mapboxData, setMapboxData] = useState(null);
  const [ elementData, setElementData ] = useState(null);
  const [networkElementsDropdown, setNetworkElementsDropdown] = useState(false);
  const [mapboxDataType, setMapboxDataType] = useState(null);
  const [mapboxDataId, setMapboxDataId] = useState("");
  const [resetDropdown, setResetDropdown] = useState(null);
  const [vehiclesData, setVehiclesData] = useState([]);
  const [ bboxSelectorVisible, setBBOXSelectorVisible ] = useState(false);
  const [bbox, setBbox] = useState(null);
  const [ bounds, setBounds ] = useState(null);

  return (
    <AppContext.Provider
      value={{
        loading,
        setLoading,
        mapboxData,
        setMapboxData,
        elementData,
        setElementData,
        networkElementsDropdown,
        setNetworkElementsDropdown,
        mapboxDataType,
        setMapboxDataType,
        mapboxDataId,
        setMapboxDataId,
        resetDropdown,
        setResetDropdown,
        vehiclesData,
        setVehiclesData,
        bboxSelectorVisible,
        setBBOXSelectorVisible,
        bbox,
        setBbox,
        bounds,
        setBounds,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  return useContext(AppContext);
};
