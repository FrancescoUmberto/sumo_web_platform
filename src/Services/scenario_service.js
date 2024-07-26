import axios from "axios";

const api_url = process.env.REACT_APP_API_URL;

export async function getScenarioByNetwork(network_id){
    const response = await axios.get(`${api_url}/sumo_scenario/scenarios_list/${network_id}`);
    return response.data;
}