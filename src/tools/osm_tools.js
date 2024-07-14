import React, { useState, useRef, useEffect } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { importBBOX } from "../Services/osm_service";
import "../css/osm_tools.css";
import { Toast } from "primereact/toast";
import { useAppContext } from "../Context/AppContext";
import Spinner from "../Components/Spinner";

export default function OSMtools() {
  const toast = useRef(null);
  const { loading, setLoading } = useAppContext();
  const [formData, setFormData] = useState({
    min_lat: "",
    min_lon: "",
    max_lat: "",
    max_lon: "",
  });
  const [isFormValid, setIsFormValid] = useState(false);

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
      localStorage.removeItem("networks");
      console.log("Data imported successfully:", response.id);
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
      <Toast ref={toast} />
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
          <div className="submitButton">
            <Button label="Import" type="submit" disabled={!isFormValid} />
          </div>
        </div>
      </form>
    </div>
  );
}
