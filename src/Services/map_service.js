import axios from "axios";

const api_url = process.env.REACT_APP_API_URL;

export async function getElement(network_id, element){
    try{
        const response = await axios.get(
            `${api_url}/map/get_element/${network_id}/${element}`
        );
        // console.log(response)
        return response.data;
    }
    catch(error){
        console.error("Error getting element", error);
        throw error;
    }
}