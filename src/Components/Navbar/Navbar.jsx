import React, { useState, useRef, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import {
  networkList,
  getNetworkGEOjson,
  downloadNetworkGEOjson,
  downloadNetworkXML,
} from "../../Services/osm_service";
import {
  getScenarioByNetwork,
  getScenarioByIdConfiguration,
  getScenarioByIdZip,
} from "../../Services/scenario_service";
import { Button } from "primereact/button";
import "./navbar.css";
import { useDialog } from "../../Context/DialogContext";
import { useAppContext } from "../../Context/AppContext";
import { OverlayPanel } from "primereact/overlaypanel";
import Spinner from "../Spinner/Spinner";
import { useToast } from "../../Context/ToastContext";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { PanelMenu } from "primereact/panelmenu";


export default function Navbar() {
  const toast = useToast();
  const { selectedNetwork, setSelectedNetwork } = useAppContext();
  const [isNetworkSelected, setIsNetworkSelected] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [loadingNetworksList, setLoadingNetworksList] = useState(false);
  const [loadingNetworkScenariosList, setLoadingNetworkScenariosList] =
    useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [playSim, setPlaySim] = useState(false);
  const [downloadItems, setDownloadItems] = useState([]);

  const {
    loading,
    setLoading,
    setMapboxData,
    setMapboxDataId,
    setResetDropdown,
    setVehiclesData,
  } = useAppContext();
  const { setDialog } = useDialog();
  const downloadOverlay = useRef(null);
  useEffect(() => {
    if (selectedNetwork !== null && selectedScenario === null) {
      setDownloadItems([
        {
          label: "Network",
          items: [
            {
              label: "GeoJSON",
              icon: "pi pi-file",
              command: () => {
                downloadNetworkGEOjson(selectedNetwork.network_id);
              },
            },
            {
              label: "XML",
              icon: "pi pi-file",
              command: () => {
                downloadNetworkXML(selectedNetwork.network_id);
              },
            },
          ],
        },
      ]);
    } else if (selectedScenario !== null) {
      setDownloadItems([
        {
          label: "Network",
          items: [
            {
              label: "GeoJSON",
              icon: "pi pi-file",
              command: () => {
                downloadNetworkGEOjson(selectedNetwork.network_id);
              },
            },
            {
              label: "XML",
              icon: "pi pi-file",
              command: () => {
                downloadNetworkXML(selectedNetwork.network_id);
              },
            },
          ],
        },
        {
          label: "Scenario",
          items: [
            {
              label: "zip",
              icon: "pi pi-file",
              command: () => {
                getScenarioByIdZip(selectedScenario.scenario_id);
              },
            },
            {
              label: "Configuration",
              icon: "pi pi-wrench",
              command: () => {
                getScenarioByIdConfiguration(selectedScenario.scenario_id);
              },
            },
          ],
        },
      ]);
    }
  }, [selectedNetwork, selectedScenario]);

  const fetchNetworks = async () => {
    setLoadingNetworksList(true);
    try {
      const response = await networkList();
      setNetworks(response);
      setLoadingNetworksList(false);
      sessionStorage.setItem("networks", JSON.stringify(response));
    } catch (error) {
      setLoadingNetworksList(false);
      console.error("Error fetching networks:", error);
    }
  };

  const handleFetchNetworks = async () => {
    if (!sessionStorage.getItem("networks")) {
      fetchNetworks();
      sessionStorage.removeItem("networks");
    } else {
      setNetworks(JSON.parse(sessionStorage.getItem("networks")));
    }
  };

  const handleNetworkChange = async (e) => {
    setResetDropdown(true);
    setSelectedNetwork(e.value);
    setMapboxDataId(e.value.network_id);
    setLoading(true);
    // if the session storage contains the scenario list, remove the item from the session storage
    if (sessionStorage.getItem("scenarios")) {
      sessionStorage.removeItem("scenarios");
    }
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

  const addButton = {
    label: "Add",
    icon: "pi pi-plus",
  };

  const fetchScenarios = async () => {
    setLoadingNetworkScenariosList(true);
    try {
      const response = await getScenarioByNetwork(selectedNetwork.network_id);
      setScenarios(response);
      setLoadingNetworkScenariosList(false);
      sessionStorage.setItem("scenarios", JSON.stringify(response)); // store the response in session storage
    } catch (error) {
      setLoadingNetworkScenariosList(false);
      console.error("Error fetching scenarios:", error);
      toast.current.show({
        severity: "error",
        summary: `Error ${error.response.data.status_code}`,
        detail: `${error.response.data.message}`,
        life: 3000,
      });
    }
  };
  const handleFetchScenarios = async () => {
    if (scenarios == null) {
      setScenarios([]);
      fetchScenarios();
    }
    try {
      if (
        scenarios.length === 0 &&
        !sessionStorage.getItem("scenarios") &&
        scenarios !== null
      ) {
        fetchScenarios();
      } else {
        setScenarios(JSON.parse(sessionStorage.getItem("scenarios")));
      }
    } catch (error) {
      console.error("Error fetching scenarios", error);
    }
  };
  const handleScenarioChange = async (e) => {
    setSelectedScenario(e.value);
  };

  const handleStartSim = () => {
    setPlaySim(true);
    const client = new W3CWebSocket("ws://localhost:62583");
    client.onmessage = (message) => {
      console.log("Message received from server:", message);
      const dataFromServer = JSON.parse(message.data);
      // add the incoming message to the state
      setVehiclesData((prev) => [...prev, dataFromServer]);
    };
  };
  return (
    <div>
      {loading && <Spinner />}
      <div className="navbar">
        <div className="dropdown card justify-content-center">
          <div>
            {loadingNetworksList && (
              <Dropdown
                loading
                placeholder="Loading networks..."
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
          {isNetworkSelected && !loadingNetworkScenariosList && (
            <div className="scenario-dropdown">
              <Dropdown
                value={selectedScenario}
                options={scenarios}
                onChange={handleScenarioChange}
                onShow={handleFetchScenarios}
                optionLabel="scenario_id"
                placeholder="Select a Scenario"
              />
            </div>
          )}
          {isNetworkSelected && loadingNetworkScenariosList && (
            <div className="scenario-dropdown">
              <Dropdown
                loading
                placeholder="Loading scenarios..."
                className="w-full md:w-14rem"
              />
            </div>
          )}

          {isNetworkSelected && (
            <div className="downloadButton">
              <Button
                icon="pi pi-download"
                severity="primary"
                rounded
                text
                onClick={(e) => {
                  downloadOverlay.current.toggle(e);
                }}
              />

              <OverlayPanel ref={downloadOverlay}>
                <PanelMenu
                  model={downloadItems}
                  className="w-full md:w-20rem"
                />
                {/*  */}
              </OverlayPanel>
            </div>
          )}
        </div>
        <div className="buttons">
          <div className="buttons">
            <Button
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                  <path
                    d="M56.3 66.3c-4.9-3-11.1-3.1-16.2-.3s-8.2 8.2-8.2 14l0 352c0 5.8 3.1 11.1 8.2 14s11.2 2.7 16.2-.3l288-176c4.8-2.9 7.7-8.1 7.7-13.7s-2.9-10.7-7.7-13.7l-288-176zM24.5 38.1C39.7 29.6 58.2 30 73 39L361 215c14.3 8.7 23 24.2 23 41s-8.7 32.2-23 41L73 473c-14.8 9.1-33.4 9.4-48.5 .9S0 449.4 0 432L0 80C0 62.6 9.4 46.6 24.5 38.1z"
                    fill="#ffffff"
                  />
                </svg>
              }
              severity="primary"
              rounded
              text
              onClick={() => {
                handleStartSim();
              }}
            />
          </div>
          {/* <div className="upload-button">
            <Button
              icon="pi pi-upload"
              severity="primary"
              rounded
              text
              onClick={() => setDialog("Upload")}
            />
          </div> */}
          <div className="create-button">
            <Button
              icon="pi pi-plus"
              severity="primary"
              rounded
              text
              onClick={() => setDialog("default-dialog")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
