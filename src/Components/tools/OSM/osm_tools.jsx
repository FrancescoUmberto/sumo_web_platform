import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { importBBOX } from "../../../Services/osm_service";
import "./osm_tools.css";
import { useToast } from "../../../Context/ToastContext";
import { useAppContext } from "../../../Context/AppContext";
import { useDialog } from "../../../Context/DialogContext";
import Spinner from "../../Spinner/Spinner";

export default function OSMtools() {
  const toast = useToast();
  const { loading, setLoading } = useAppContext();
  const [formData, setFormData] = useState({
    min_lat: "",
    min_lon: "",
    max_lat: "",
    max_lon: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);
  const { setDialogVisible } = useDialog();
  const { setBBOXSelectorVisible } = useAppContext();
  const { setDialog } = useDialog();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => {
      const updatedFormData = {
        ...prevFormData,
        [name]: value,
      };
      validateForm(updatedFormData); // Validate the form whenever there's a change
      return updatedFormData;
    });
  };

  const validateForm = (data) => {
    const { min_lat, min_lon, max_lat, max_lon } = data;
    const isValid =
      min_lat !== "" &&
      min_lon !== "" &&
      max_lat !== "" &&
      max_lon !== "" &&
      !isNaN(min_lat) &&
      !isNaN(min_lon) &&
      !isNaN(max_lat) &&
      !isNaN(max_lon);
    setIsFormValid(isValid);
  };

  useEffect(() => {
    validateForm(formData); // Initial validation on mount
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { min_lat, min_lon, max_lat, max_lon } = formData;
    setLoading(true);

    try {
      const response = await importBBOX(min_lat, min_lon, max_lat, max_lon);
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: "Network ID: " + response.id,
      });
      sessionStorage.removeItem("networks");
      // reset the form
      setFormData({
        min_lat: "",
        min_lon: "",
        max_lat: "",
        max_lon: "",
      });
      // console.log("Data imported successfully:", response.id);
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `${error.code}`,
      });
      console.error("Error importing data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {loading && <Spinner />}
      <form onSubmit={handleSubmit} id="importBBOXForm">
        <div className="form">
          <div className="coordinates">
            <div className="card flex justify-content-center">
              <FloatLabel>
                <InputText
                  keyfilter="num"
                  name="min_lat"
                  value={formData.min_lat}
                  onChange={handleChange}
                />
                <label htmlFor="min_lat">min_lat</label>
              </FloatLabel>
            </div>
            <div className="card flex justify-content-center">
              <FloatLabel>
                <InputText
                  keyfilter="num"
                  name="min_lon"
                  value={formData.min_lon}
                  onChange={handleChange}
                />
                <label htmlFor="min_lon">min_lon</label>
              </FloatLabel>
            </div>
          </div>
          <div className="coordinates">
            <div className="card flex justify-content-center">
              <FloatLabel>
                <InputText
                  keyfilter="num"
                  name="max_lat"
                  value={formData.max_lat}
                  onChange={handleChange}
                />
                <label htmlFor="max_lat">max_lat</label>
              </FloatLabel>
            </div>
            <div className="card flex justify-content-center">
              <FloatLabel>
                <InputText
                  keyfilter="num"
                  name="max_lon"
                  value={formData.max_lon}
                  onChange={handleChange}
                />
                <label htmlFor="max_lon">max_lon</label>
              </FloatLabel>
            </div>
          </div>
        </div>
      </form>
      <div className="formButtons">
        <div className="importButtonBox">
          <div className="selectBBOXButton">
            <Button
              rounded
              text
              type="button"
              onClick={() => {
                setDialogVisible(false);
                setBBOXSelectorVisible(true);
              }}
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 510">
                  <path
                    fill="whitesmoke"
                    d="M64 128a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm0-96c29.8 0 54.9 20.4 62 48l196 0c7.1-27.6 32.2-48 62-48c35.3 0 64 28.7 64 64c0 29.8-20.4 54.9-48 62l0 196c27.6 7.1 48 32.2 48 62c0 35.3-28.7 64-64 64c-29.8 0-54.9-20.4-62-48l-196 0c-7.1 27.6-32.2 48-62 48c-35.3 0-64-28.7-64-64c0-29.8 20.4-54.9 48-62l0-196C20.4 150.9 0 125.8 0 96C0 60.7 28.7 32 64 32zm62 368l196 0c5.8-22.5 23.5-40.2 46-46l0-196c-22.5-5.8-40.2-23.5-46-46l-196 0c-5.8 22.5-23.5 40.2-46 46l0 196c22.5 5.8 40.2 23.5 46 46zM96 416a32 32 0 1 0 -64 0 32 32 0 1 0 64 0zm256 0a32 32 0 1 0 64 0 32 32 0 1 0 -64 0zm32-288a32 32 0 1 0 0-64 32 32 0 1 0 0 64z"
                  />
                </svg>
              }
            />
          </div>
          <div className="upload-button">
            <Button
              icon="pi pi-upload"
              rounded
              text
              onClick={() => setDialog("Upload")}
            />
          </div>
        </div>
        <div className="submitButton">
          <Button
            label="Import"
            type="submit"
            disabled={!isFormValid}
            onClick={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
