import React, { useState, useRef } from "react";
import { Dropdown } from "primereact/dropdown";
import {
  networkList,
  getNetworkGEOjson,
  downloadNetworkGEOjson,
  downloadNetworkXML,
} from "../Services/osm_service";
import { Button } from "primereact/button";
import "../css/navbar.css";
import { useDialog } from "../Context/DialogContext";
import { useAppContext } from "../Context/AppContext";
import { OverlayPanel } from "primereact/overlaypanel";
import Spinner from "../Components/Spinner";
import { Toast } from "primereact/toast";

export default function Navbar({ onPageChange }) {
  const toast = useRef(null);
  const [isNetworkSelected, setIsNetworkSelected] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [loadingNetworksList, setLoadingNetworksList] = useState(false);
  const {
    loading,
    setLoading,
    setMapboxData,
    setMapboxDataId,
    setResetDropdown,
  } = useAppContext();
  const { setDialog } = useDialog();
  const downloadOverlay = useRef(null);

  const fetchNetworks = async () => {
    setLoadingNetworksList(true);
    try {
      const response = await networkList();
      setNetworks(response);
      setLoadingNetworksList(false);
      sessionStorage.setItem("networks", JSON.stringify(response)); // store the response in session storage
    } catch (error) {
      setLoadingNetworksList(false);
      console.error("Error fetching networks:", error);
    }
  };

  const handleFetchNetworks = async () => {
    if (networks.length === 0 && !sessionStorage.getItem("networks")) {
      fetchNetworks();
    } else {
      setNetworks(JSON.parse(sessionStorage.getItem("networks")));
    }
  };

  const handleNetworkChange = async (e) => {
    setResetDropdown(true);
    setSelectedNetwork(e.value);
    setMapboxDataId(e.value.network_id);
    setLoading(true);

    try {
      const geojson = await getNetworkGEOjson(e.value.network_id);
      setMapboxData(geojson); // update the context with the fetched GeoJSON data
      setIsNetworkSelected(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.current.show({
        severity: "error",
        summary: `${error.response.data.message} ${error.response.data.status_code}`,
        detail: error.message,
        life: 3000,
      });
      fetchNetworks();
      console.error("Errore durante il download del file", error);
    }
  };
  
  return (
    <div>
      {loading && <Spinner />}
      <Toast ref={toast} />
      <div className="navbar">
        <div className="dropdown card justify-content-center">
          <div>
            {loadingNetworksList && (
              <Dropdown
                loading
                placeholder="Loading..."
                className="w-full md:w-14rem"
              />
            )}
            {!loadingNetworksList && (
              <Dropdown
                value={selectedNetwork}
                options={networks}
                onChange={handleNetworkChange}
                onShow={handleFetchNetworks}
                optionLabel="network_id"
                placeholder="Select a Network"
              />
            )}
          </div>
          {isNetworkSelected && (
            <div className="downloadButton">
              <Button
                icon="pi pi-download"
                severity="primary"
                rounded
                text
                onClick={(e) => downloadOverlay.current.toggle(e)}
              />
              <OverlayPanel ref={downloadOverlay}>
                <div className="formatDownloadOverlay">
                  <div className="formatDownloadButton">
                    <Button
                      icon="pi pi-file"
                      label="GeoJSON Format"
                      severity="primary"
                      rounded
                      text
                      onClick={() =>
                        downloadNetworkGEOjson(selectedNetwork.network_id)
                      }
                    />
                  </div>
                  <div className="formatDownloadButton">
                    <Button
                      icon="pi pi-file"
                      label="XML Format"
                      severity="primary"
                      rounded
                      text
                      onClick={() =>
                        downloadNetworkXML(selectedNetwork.network_id)
                      }
                    />
                  </div>
                </div>
              </OverlayPanel>
            </div>
          )}
        </div>
        <div className="buttons">
          <div className="upload-button">
            <Button icon="pi pi-upload" severity="primary" rounded text onClick={() => setDialog("Upload")}/>
          </div>
          <div className="create-button">
            <Button
              icon="pi pi-plus"
              severity="primary"
              rounded
              text
              onClick={() => setDialog("Network")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
