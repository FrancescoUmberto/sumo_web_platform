import "./NetworkOptions.css";
import DropdownElements from "./DropdownElements/DropdownElements";
import { Button } from "primereact/button";
import { useAppContext } from "../../Context/AppContext";
import { useDialog } from "../../Context/DialogContext";
import { deleteNetwork } from "../../Services/osm_service";

export default function NetworkOptions() {
  const { selectedNetwork, setSelectedNetwork } = useAppContext();
  const { setDialogVisible } = useDialog();
  const { setDialog } = useDialog();
  const { setMapboxData } = useAppContext();
  const { setLoading } = useAppContext();
  const network_id = selectedNetwork?.network_id;
  const handleDeleteNetwork = async (network_id) => {
    try {
      setLoading(true);
      await deleteNetwork(network_id);
      setMapboxData(null);
      setLoading(false);
      setSelectedNetwork(null);
      sessionStorage.removeItem("networks");
    } catch (error) {
      console.error("Error deleting network:", error);
    }
  };
  return (
    <div className="network-options">
      <div className="title">
        <strong>Network Visualization Options</strong>
      </div>
      <div className="dropdown-elements">
        <DropdownElements />
      </div>
      <div className="btnBox">
        <div>
          <Button
            className="deleteNetworkBtn"
            icon="pi pi-trash"
            label="Delete"
            iconPos="left"
            rounded
            onClick={() => handleDeleteNetwork(network_id)}
          />
        </div>
        <div>
          <Button
            className="updateNetworkBtn"
            label="Edit"
            icon="pi pi-pencil"
            iconPos="left"
            rounded
            onClick={() => {
              setDialogVisible(true);
              setDialog("update_network");
            }}
          />
        </div>
      </div>
    </div>
  );
}
