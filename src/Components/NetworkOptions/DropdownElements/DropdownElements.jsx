import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { getElement } from "../../../Services/map_service";
import { useAppContext } from "../../../Context/AppContext";
import "./dropdownElements.css";

const options = [
  { name: "DEFAULT", id: "default" },
  { name: "TRAFFIC LIGHT", id: "traffic_light" },
  { name: "CICLEWAY", id: "highway.cycleway" },
  { name: "FOOTWAY", id: "highway.footway" },
  { name: "PEDESTRIAN", id: "highway.pedestrian" },
  { name: "RESIDENTIAL", id: "highway.residential" },
  { name: "SECONDARY", id: "highway.secondary" },
  { name: "SERVICE", id: "highway.service" },
  { name: "STEPS", id: "highway.steps" },
  { name: "TERTIARY", id: "highway.tertiary" },
  { name: "UNCLASSIFIED", id: "highway.unclassified" },
  { name: "RAIL", id: "railway.rail" },
];

export default function DropdownElements() {
  const [selectedOption, setSelectedOption] = useState(options[0]);
  const {
    setLoading,
    setElementData,
    setMapboxDataType,
    mapboxDataId,
    resetDropdown,
    setResetDropdown,
  } = useAppContext();
  // print the resetDropdown value to the console with the time of the log
  // console.log("resetDropdown", resetDropdown, new Date().toLocaleTimeString());
  const handleOptionSelection = async (e) => {
    if (resetDropdown) return;
    setSelectedOption(e.value);
    try {
      if (e.value.id === "default") {
        setMapboxDataType("Default")
        return;
      }
      else if (e.value.id === "traffic_light") {
        setLoading(true);
        const response = await getElement(mapboxDataId, e.value.id);
        setMapboxDataType("traffic_lights");
        setElementData(response);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching element:", error);
    }
  };

  useEffect(() => {
    if (resetDropdown) {
      setSelectedOption(options[0]);
      setResetDropdown(false);
    }
  }, [resetDropdown, setResetDropdown]);

  return (
      <Dropdown
        className="network-elements"
        value={selectedOption}
        options={options}
        onChange={handleOptionSelection}
        placeholder="Select network element"
        optionLabel="name"
        optionValue="id"
      />
  );
}
