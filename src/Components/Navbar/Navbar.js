import React, { useState, useRef, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import {
  networkList,
  getNetworkGEOjson,
  downloadNetworkGEOjson,
  downloadNetworkXML,
} from "../../Services/osm_service";
import { getScenarioByNetwork } from "../../Services/scenario_service";
import { Button } from "primereact/button";
import "./navbar.css";
import { useDialog } from "../../Context/DialogContext";
import { useAppContext } from "../../Context/AppContext";
import { OverlayPanel } from "primereact/overlaypanel";
import Spinner from "../Spinner/Spinner";
import { useToast } from '../../Context/ToastContext'; 
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { PanelMenu } from "primereact/panelmenu";

export default function Navbar() {
  const toast = useToast(); 
  const [isNetworkSelected, setIsNetworkSelected] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [loadingNetworksList, setLoadingNetworksList] = useState(false);
  const [loadingNetworkScenariosList, setLoadingNetworkScenariosList] =
    useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [playSim, setPlaySim] = useState(false);

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
  const downloadItems = [
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
        },
        {
          label: "Configuration",
          icon: "pi pi-wrench",
        },
      ],
    },
  ];
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
    if (!sessionStorage.getItem("networks")) {
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
    const client = new W3CWebSocket("ws://localhost:6789");
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
              icon="pi pi-play"
              severity="primary"
              rounded
              text
              onClick={() => {
                handleStartSim();
              }}
            />
          </div>
          <div className="upload-button">
            <Button
              icon="pi pi-upload"
              severity="primary"
              rounded
              text
              onClick={() => setDialog("Upload")}
            />
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
