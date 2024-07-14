import axios from "axios";

const api_url = process.env.REACT_APP_API_URL;

export async function importBBOX(min_lat, min_lon, max_lat, max_lon) {
  const response = await axios.post(
    `${api_url}/osm/importByBBOX`,
    {
      min_lat,
      min_lon,
      max_lat,
      max_lon,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
}
export async function networkList() {
  const response = await axios.get(`${api_url}/osm/networks`);
  return response.data;
}
export async function downloadNetworkGEOjson(network_id) {
  try {
    const response = await axios.get(
      `${api_url}/osm/getNetworkGEOJSON/${network_id}`,
      {
        responseType: "blob",
      }
    );

    // Deserialize the response data
    const jsonResponse = await response.data.text();
    // Transform the response data to a JSON object
    const geojsonResponse = JSON.parse(jsonResponse);
    // console.log(geojsonResponse);
    // Crea un URL oggetto per il blob
    const url = window.URL.createObjectURL(new Blob([geojsonResponse]));
    const link = document.createElement("a");
    link.href = url;

    // Imposta il nome del file
    link.setAttribute("download", `${network_id}.geojson`);
    document.body.appendChild(link);
    link.click();

    // Pulisci l'URL oggetto dopo il download
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Errore durante il download del file", error);
  }
}
export async function downloadNetworkXML(network_id) {
  try {
    const response = await axios.get(`${api_url}/osm/networks/${network_id}`, {
      responseType: "blob",
    });

    // Deserialize the response data
    const xmlResponse = await response.data.text();
    // console.log(xmlResponse);
    // Crea un URL oggetto per il blob
    const url = window.URL.createObjectURL(new Blob([xmlResponse]));
    const link = document.createElement("a");
    link.href = url;

    // Imposta il nome del file
    link.setAttribute("download", `${network_id}.net.xml`);
    document.body.appendChild(link);
    link.click();

    // Pulisci l'URL oggetto dopo il download
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Errore durante il download del file", error);
  }
}
export async function getNetworkGEOjson(network_id) {
  try {
    const response = await axios.get(
      `${api_url}/osm/getNetworkGEOJSON/${network_id}`
    );
    // deserialize the response data
    return response.data;
  } catch (error) {
    console.error("Errore durante il download del file", error);
    throw error;
  }
}
export async function importNetFile(file) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    // console.log("file", file);
    // post the file to the server
    const response = await axios.post(
      `${api_url}/osm/importNetFile`,
      formData, // <--- Pass formData directly here
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error importing network file", error);
    throw error;
  }
}
