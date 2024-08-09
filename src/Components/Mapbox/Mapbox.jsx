import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import "./mapbox.css";
import { useAppContext } from "../../Context/AppContext";
import Spinner from "../Spinner/Spinner";
import { useToast } from "../../Context/ToastContext";

export default function Mapbox() {
  const { loading, bbox, setBbox } = useAppContext();
  const { networkElementsDropdown, setNetworkElementsDropdown } =
    useAppContext();
  const mapContainer = useRef(null);
  const toast = useToast();
  const map = useRef(null);
  const [lng, setLng] = useState(16.879213);
  const [lat, setLat] = useState(41.108504);
  const [zoom, setZoom] = useState(12);
  const { mapboxData } = useAppContext();
  const { elementData, setElementData } = useAppContext();
  const { mapboxDataType, setResetDropdown } = useAppContext();
  const { vehiclesData } = useAppContext();
  const { bounds, setBounds } = useAppContext();
  useEffect(() => {
    if (mapboxData == null) {
      try {
        // remove the network layer
        map.current.removeLayer("network");
        map.current.removeSource("network");
        setNetworkElementsDropdown(false);
        // remove the element layer
        map.current.removeLayer("traffic_lights");
        map.current.removeSource("traffic_lights");
        setElementData(null);
      } catch (error) {}
    }
  }, [mapboxData]);

  useEffect(() => {
    if (mapboxDataType == "Default") {
      try {
        map.current.removeLayer("traffic_lights");
        map.current.removeSource("traffic_lights");
      } catch (error) {}
    }
  });

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
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  }, [lng, lat, zoom]);

  useEffect(() => {
    if (bbox && map.current) {
      const { left, top, right, bottom } = bbox;

      // Apply bias to the coordinates
      const adjustedLeft = left;
      const adjustedTop = top;
      const adjustedRight = right;
      const adjustedBottom = bottom;

      // console.log("Adjusted BBOX values:", { adjustedLeft, adjustedTop, adjustedRight, adjustedBottom });

      // Convert pixel coordinates to map coordinates
      const bottomLeft = map.current.unproject([adjustedLeft, adjustedBottom]);
      const topRight = map.current.unproject([adjustedRight, adjustedTop]);

      setBounds([bottomLeft, topRight]);

      // console.log("Bounding Box Coordinates:", bounds);
    }
  }, [bbox]);

  useEffect(() => {
    if (vehiclesData.length > 0 && map.current) {
      const geojson = {
        type: "FeatureCollection",
        features: vehiclesData,
      };

      if (map.current.getSource("vehicles")) {
        map.current.getSource("vehicles").setData(geojson);
      } else {
        map.current.addSource("vehicles", {
          type: "geojson",
          data: geojson,
        });
        map.current.addLayer({
          id: "vehicles",
          type: "circle",
          source: "vehicles",
          paint: {
            "circle-radius": 4,
            "circle-color": "#007cbf",
          },
        });
        map.current.on("click", "vehicles", (e) => {
          new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(
              "Position <br>" +
                "Longitude: " +
                e.lngLat.wrap().lng.toFixed(5) +
                "<br>" +
                "Latitude: " +
                e.lngLat.wrap().lat.toFixed(5) +
                "<br>" +
                "Vehicle: " +
                e.features[0]._vectorTileFeature.properties.id
            )
            .addTo(map.current);
        });
      }
    }
  }, [vehiclesData]);

  useEffect(() => {
    try {
      if (mapboxData && map.current) {
        if (typeof mapboxData === "string") {
          var geojson = JSON.parse(mapboxData);
        } else {
          var geojson = mapboxData;
        }
        // Handle network layer
        setElementData(null);
        try {
          if (map.current.getLayer(mapboxDataType)) {
            map.current.getSource("traffic_lights").setData(elementData);
            map.current.removeLayer("traffic_lights");
            map.current.removeSource("traffic_lights");
          }
        } catch (error) {
          console.error("Error removing element layer:", error);
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
            new mapboxgl.Popup()
              .setLngLat(e.lngLat)
              .setHTML(
                "Position <br>" +
                  "Longitude: " +
                  e.lngLat.wrap().lng.toFixed(5) +
                  "<br> " +
                  "Latitude: " +
                  e.lngLat.wrap().lat.toFixed(5) +
                  "<br>" +
                  "Element: " +
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
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(
                  "Position <br>" +
                    "Longitude: " +
                    e.lngLat.wrap().lng +
                    ", " +
                    "Latitude: " +
                    e.lngLat.wrap().lat +
                    "<br>" +
                    `Traffic Light ${e.features[0]._vectorTileFeature.properties.id}`
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
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
