import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "../css/mapbox.css";
import { useAppContext } from "../Context/AppContext";
import Spinner from "../Components/Spinner";
import { Toast } from "primereact/toast";

export default function Mapbox() {
  const { loading, setLoading } = useAppContext();
  const { networkElementsDropdown, setNetworkElementsDropdown } =
    useAppContext();
  const mapContainer = useRef(null);
  const toast = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(16.879213);
  const [lat, setLat] = useState(41.108504);
  const [zoom, setZoom] = useState(12);
  const { mapboxData } = useAppContext();
  const { elementData, setElementData } = useAppContext();
  const { mapboxDataType, setResetDropdown } = useAppContext();

  useEffect(() => {
    try {
      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
      if (map.current) return; // initialize map only once
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/standard",
        center: [lng, lat],
        zoom: zoom,
      });
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, []);

  useEffect(() => {
    try {
      if (mapboxData && map.current) {
        const geojson = JSON.parse(mapboxData);
        // Handle network layer
        setElementData(null);
        if (map.current.getLayer(mapboxDataType)) {
          map.current.getSource("traffic_lights").setData(elementData);
          map.current.removeLayer("traffic_lights");
          map.current.removeSource("traffic_lights");
        }
        if (map.current.getSource("network")) {
          map.current.getSource("network").setData(geojson);
        } else {
          map.current.addSource("network", {
            type: "geojson",
            data: geojson,
          });
          map.current.addLayer({
            id: "network",
            type: "line",
            source: "network",
            layout: {},
            paint: {
              "line-color": "#888",
              "line-width": 5,
            },
          });
          // Add a popup to the network layer
          map.current.on("click", "network", (e) => {
            // console.log("Feature network:", e.features[0]._vectorTileFeature.properties.id);
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(
                `${e.features[0]._vectorTileFeature.properties.element} ${e.features[0]._vectorTileFeature.properties.id}`
              )
              .addTo(map.current);
          });
          setNetworkElementsDropdown(true);
          // Toast for network load success
          toast.current.show({
            severity: "success",
            summary: "Success",
            detail: "Network loaded successfully",
          });
        }

        // Handle element layer if mapboxDataType is "element"
        if (elementData && mapboxDataType === "traffic_lights") {
          const elementGeojson = JSON.parse(elementData);
          if (map.current.getSource("traffic_lights")) {
            map.current.getSource("traffic_lights").setData(elementGeojson);
          } else {
            map.current.addSource("traffic_lights", {
              type: "geojson",
              data: elementGeojson,
            });
            map.current.addLayer({
              id: "traffic_lights",
              type: "circle",
              source: "traffic_lights",
              paint: {
                "circle-radius": 8,
                "circle-color": "#B42222",
              },
            });
            // Add a popup to the element layer
            map.current.on("click", "traffic_lights", (e) => {
              // console.log("Feature traffic_lights:", e.features[0]._vectorTileFeature.properties.id);
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(
                  `Traffic Light: ${e.features[0]._vectorTileFeature.properties.id}`
                )
                .addTo(map.current);
            });
            // Toast for network load success
            toast.current.show({
              severity: "success",
              summary: "Success",
              detail: "Traffic Lights loaded successfully",
            });
          }
        }
      }
    } catch (error) {
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: `${error}`,
      });
      console.error("Error setting map data:", error);
    }
  }, [mapboxData, mapboxDataType, setNetworkElementsDropdown]);

  return (
    <div>
      {loading && <Spinner />}
      <Toast ref={toast} />
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
