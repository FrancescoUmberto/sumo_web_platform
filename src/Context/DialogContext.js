import React, { useState, createContext, useContext } from "react";

// Create the context
const DialogContext = createContext();

// Create a provider component
export const DialogProvider = ({ children }) => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [dialogData, setDialogData] = useState({});
  const showDialog = () => setDialogVisible(true);
  const hideDialog = () => setDialogVisible(false);
  const setDialog = (data) => {
    setDialogData(data);
    setDialogVisible(true);
  };

  return (
    <DialogContext.Provider value={{ dialogVisible, showDialog, hideDialog, setDialog, dialogData, setDialogVisible }}>
      {children}
    </DialogContext.Provider>
  );
};

// Custom hook to use the DialogContext
export const useDialog = () => {
  return useContext(DialogContext);
};
