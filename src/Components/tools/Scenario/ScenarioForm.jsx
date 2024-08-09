import React, { useState } from "react";
import "./ScenarioForm.css";
import { Dropdown } from "primereact/dropdown";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { networkList } from "../../../Services/osm_service";

export default function ScenarioForm() {
  const [networks, setNetworks] = useState([]);
  const [loadingNetworksList, setLoadingNetworksList] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);

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
    // if the session storage contains the scenario list, remove the item from the session storage
    if (sessionStorage.getItem("scenarios")) {
      sessionStorage.removeItem("scenarios");
    }
    setSelectedNetwork(e.value);
    try {
    } catch (error) {
      fetchNetworks();
      console.error("Errore durante il download del file", error);
    }
  };

  return (
    <div className="scenario-form">
      <form id="scenarioCreationForm">
        <div className="items-row-box">
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
          <div>
            <FloatLabel>
              <InputText id="scenarioName" name="scenarioName" />
              <label htmlFor="scenarioName">Scenario Name</label>
            </FloatLabel>
          </div>
        </div>
        <div className="items-row-box">

        </div>
      </form>
    </div>
  );
}
