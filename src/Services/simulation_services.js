import axios from "axios";

const api_url = process.env.REACT_APP_API_URL;

export async function createSimulation(scenario_id){
    const response = await axios.get(`${api_url}/simulation/create/${scenario_id}`);
    console.log(response.data);
    return response.data;
}