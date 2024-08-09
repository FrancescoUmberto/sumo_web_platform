import React, { useEffect, useState, useRef } from "react";
import { useDialog } from "../../Context/DialogContext";
import { useAppContext } from "../../Context/AppContext";
import { Dialog } from "primereact/dialog";
import OSMtools from "../tools/OSM/osm_tools";
import { FileUpload } from "primereact/fileupload";
import {
  importNetFile,
  importOsmFile,
  updateNetwork,
  getNetworkGEOjson,
} from "../../Services/osm_service";
import { useToast } from "../../Context/ToastContext";
import "./dialog.css";
import { Accordion, AccordionTab } from "primereact/accordion";
import ScenarioForm from "../tools/Scenario/ScenarioForm";

const url = process.env.REACT_APP_API_URL;

export default function CustomDialog() {
  const toast = useToast();
  const { dialogVisible, hideDialog, dialogData, setDialogVisible } =
    useDialog();
  const { setLoading } = useAppContext();
  const { selectedNetwork } = useAppContext();
  const { setMapboxData } = useAppContext();
  const [headerInfo, setHeaderInfo] = useState("");

  useEffect(() => {
    if (dialogData === "default-dialog") {
      setHeaderInfo("Create or import dialog");
    } else if (dialogData === "Upload") {
      setHeaderInfo("Upload a network or osm file");
    } else if (dialogData === "update_network") {
      setHeaderInfo(`Update network: ${selectedNetwork.network_id}`);
    }
  }, [dialogData]);

  const onBeforeSend = async (event) => {
    const file = event.files[0]; // Get the first file loaded
    setLoading(true);
    try {
      const response = await importNetFile(file);
      sessionStorage.removeItem("networks");
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

  const onBeforeSendUpdate = async (event) => {
    const file = event.files[0]; // Get the first file loaded
    setLoading(true);
    try {
      const response = await updateNetwork(selectedNetwork.network_id, file);
      if (response) {
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: `Network ID: ${selectedNetwork.network_id} updated`,
        });
        const geojson = await getNetworkGEOjson(selectedNetwork.network_id);
        setDialogVisible(false);
        setMapboxData(geojson); // update the context with the fetched GeoJSON data);
        setLoading(false);
      } else {
        setLoading(false);
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
      <Dialog visible={dialogVisible} onHide={hideDialog} header={headerInfo}>
        <Accordion>
          {dialogData === "default-dialog" && (
            <AccordionTab header="Import network">
              <OSMtools />
            </AccordionTab>
          )}
          {dialogData === "default-dialog" && (
            <AccordionTab header="Create scenario">
              <ScenarioForm />
            </AccordionTab>
          )}
        </Accordion>
        {dialogData === "Upload" && (
          <FileUpload
            name="file"
            customUpload
            accept=".osm,.xml"
            chooseLabel="Select the file"
            uploadHandler={onBeforeSend}
          />
        )}
        {dialogData === "update_network" && (
          <FileUpload
            name="file"
            customUpload
            accept=".osm,.xml"
            chooseLabel="Select the file"
            uploadHandler={onBeforeSendUpdate}
          />
        )}
      </Dialog>
    </div>
  );
}
