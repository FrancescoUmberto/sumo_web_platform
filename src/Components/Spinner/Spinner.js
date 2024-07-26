import { useAppContext } from "../../Context/AppContext";
import { ProgressSpinner } from "primereact/progressspinner";
import "./spinner.css";

export default function Spinner() {
  const { loading } = useAppContext(); // Utilizzo del contesto per impostare lo stato di caricamento
  return (
    <div className="overlay">
      {loading && (
        <div className="spinner card flex justify-content-center">
          <ProgressSpinner />
        </div>
      )}
    </div>
  );
}
