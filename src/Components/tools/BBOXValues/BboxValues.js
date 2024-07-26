import React, { useEffect } from "react";
import "./BboxValues.css";
import { useAppContext } from "../../../Context/AppContext";
import { Button } from "primereact/button";
import { importBBOX } from "../../../Services/osm_service";
import Spinner from "../../Spinner/Spinner";
import { useToast } from "../../../Context/ToastContext";

export default function BboxValues() {
  const { bounds } = useAppContext();
  const { setBBOXSelectorVisible } = useAppContext();
  const { loading, setLoading } = useAppContext();
  const { setBounds } = useAppContext();
  const toast = useToast();

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "N/A";
    return num.toFixed(4);
  };

  const handleCancel = () => {
    setBBOXSelectorVisible(false);
    setBounds(null);
  };
  const handleSubmit = () => {
    // console.log(bounds[0]);
    // console.log(bounds[1]);
    setLoading(true);
    importBBOX(bounds[0].lat, bounds[0].lng, bounds[1].lat, bounds[1].lng).then(
      (res) => {
        setLoading(false);
        setBBOXSelectorVisible(false);
        console.log(res.id);
        const networks = sessionStorage.getItem("networks");
        // add res to networks
        const networksList = networks ? networks + "," + res.id : res.id;
        // sessionStorage.setItem("networks",networksList);
        toast.current.show({
          severity: "success",
          summary: "Success",
          detail: `Network ID: ${res.id}`,
        });

      }
    );
  };

  return (
    <div className="bbox-values">
      {loading && <Spinner />}
      {/* <Toast ref={toast} /> */}
      <h3>BBOX Values</h3>
      <div className="bbox">
        {bounds && bounds.length > 0 ? (
          <>
            <div className="coordinates">
              <div className="lat_coordinates">
                <div>
                  <span>min_lat </span>
                  <span>{formatNumber(bounds[0]?.lat)}</span>
                </div>
                <div>
                  <span>max_lat </span>
                  <span>{formatNumber(bounds[1]?.lat)}</span>
                </div>
              </div>
              <div className="long_coordinates">
                <div>
                  <span>min_lon </span>
                  <span>{formatNumber(bounds[0]?.lng)}</span>
                </div>
                <div>
                  <span>max_lon </span>
                  <span>{formatNumber(bounds[1]?.lng)}</span>
                </div>
              </div>
            </div>
            <div className="buttonsBox">
              <Button
                className="cancelButton"
                icon="pi pi-times"
                text
                rounded
                severity="danger"
                onClick={handleCancel}
              />
              <Button
                className="importButton"
                label="Import"
                icon="pi pi-check"
                text
                rounded
                severity="success"
                onClick={handleSubmit}
              />
            </div>
          </>
        ) : (
          <div className="emptyBox">
            <div>
              <span>No BBOX values selected</span>
            </div>
            <div className="buttonsBox">
              <Button
                className="cancelButton"
                icon="pi pi-times"
                text
                rounded
                severity="danger"
                onClick={handleCancel}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
