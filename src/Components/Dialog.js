import React, { useEffect, useState, useRef } from "react";
import { useDialog } from "../Context/DialogContext";
import { Dialog } from "primereact/dialog";
import OSMtools from "../tools/osm_tools";
import { FileUpload } from "primereact/fileupload";
import { importNetFile } from "../Services/osm_service";
import { Toast } from "primereact/toast";

const url = process.env.REACT_APP_API_URL;

export default function CustomDialog() {
  const { dialogVisible, hideDialog, dialogData } = useDialog();
  const [headerInfo, setHeaderInfo] = useState("");
  const toast = useRef(null);

  useEffect(() => {
    if (dialogData === "Network") {
      setHeaderInfo("Import a network by BBOX");
    } else if (dialogData === "Upload") {
      setHeaderInfo("Upload a network or osm file");
    }
  }, [dialogData]);


  const onBeforeSend = async (event) => {
    const file = event.files[0]; // Accedi al primo file caricato
    try {
      const response = await importNetFile(file);
      if (response) {
        const network_id = response.id;
        // toast with the network_id
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: `Network ID: ${network_id}`,
        });
      } else {
        throw new Error("File upload failed");
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
      <Toast ref={toast} />
      <Dialog visible={dialogVisible} onHide={hideDialog} header={headerInfo}>
        {dialogData === "Network" && <OSMtools />}
        {dialogData === "Upload" && (
          <FileUpload
            name="file"
            customUpload
            chooseLabel="Upload a file"
            uploadHandler={onBeforeSend} // Use uploadHandler instead of onBeforeSend
          />
        )}
      </Dialog>
    </div>
  );
}
