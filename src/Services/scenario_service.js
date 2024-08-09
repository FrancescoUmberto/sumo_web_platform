import axios from "axios";

const api_url = process.env.REACT_APP_API_URL;

export async function getScenarioByNetwork(network_id) {
  const response = await axios.get(
    `${api_url}/sumo_scenario/scenarios_list/${network_id}`
  );
  return response.data;
}

export async function getScenarioByIdZip(scenario_id) {
  try {
    const response = await axios.get(
      `${api_url}/sumo_scenario/scenario_download/${scenario_id}`,
      {
        responseType: "blob",
      }
    );
    // Deserialize the response data
    const jsonResponse = await response.data.text();

    // Create a URL object for the blob
    const url = window.URL.createObjectURL(new Blob([jsonResponse]));
    const link = document.createElement("a");
    link.href = url;

    // Imposta il nome del file
    link.setAttribute("download", `${scenario_id}.zip`);
    document.body.appendChild(link);
    link.click();

    // Clear the URL object after the download
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.log("Error downloading the file", error);
  }
}

export async function getScenarioByIdConfiguration(scenario_id) {
  try {
    const response = await axios.get(
      `${api_url}/sumo_scenario/scenario_config/${scenario_id}`,
      {
        responseType: "blob",
      }
    );

    // Deserialize the response data
    const jsonResponse = await response.data.text();

    // Create a URL object for the blob
    const url = window.URL.createObjectURL(new Blob([jsonResponse]));
    const link = document.createElement("a");
    link.href = url;

    // Set the file name
    link.setAttribute("download", `${scenario_id}_config.json`);
    document.body.appendChild(link);
    link.click();

    // Clear the URL object after the download
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading the file", error);
  }
}
