import React, { useEffect, useState, useRef } from "react";
import { useDialog } from "../../Context/DialogContext";
import { useAppContext } from "../../Context/AppContext";
import { Dialog } from "primereact/dialog";
import OSMtools from "../tools/OSM/osm_tools";
import { FileUpload } from "primereact/fileupload";
import { importNetFile, importOsmFile } from "../../Services/osm_service";
import { useToast } from "../../Context/ToastContext";
import "./dialog.css";

const url = process.env.REACT_APP_API_URL;

export default function CustomDialog() {
  const toast = useToast();
  const { dialogVisible, hideDialog, dialogData } = useDialog();
  const { setLoading } = useAppContext();
  const [headerInfo, setHeaderInfo] = useState("");

  useEffect(() => {
    if (dialogData === "Network") {
      setHeaderInfo("Import a network by BBOX");
    } else if (dialogData === "Upload") {
      setHeaderInfo("Upload a network or osm file");
    }
  }, [dialogData]);

  const onBeforeSend = async (event) => {
    const file = event.files[0]; // Get the first file loaded
    setLoading(true);
    try {
      const response = await importNetFile(file);
      if (file.name.includes(".xml")) {
        if (response) {
          setLoading(false);
          const network_id = response.id;
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: `Network ID: ${network_id}`,
          });
          event.options.clear(); // Clear the file input
        } else {
          throw new Error("File upload failed");
        }
      } else if (file.name.includes(".osm")) {
        const response = await importOsmFile(file);
        if (response) {
          setLoading(false);
          const network_id = response.id;
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: `Network ID: ${network_id}`,
          });
          event.options.clear(); // Clear the file input
        } else {
          setLoading(false);
          throw new Error("File upload failed");
        }
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: error.message,
      });
    }
  };

  return (
    <div>
      <Dialog visible={dialogVisible} onHide={hideDialog} header={headerInfo}>
        {dialogData === "Network" && <OSMtools />}
        {dialogData === "Upload" && (
          <FileUpload
            name="file"
            customUpload
            accept=".osm,.xml"
            chooseLabel="Select the file"
            uploadHandler={onBeforeSend}
          />
        )}
      </Dialog>
    </div>
  );
}
