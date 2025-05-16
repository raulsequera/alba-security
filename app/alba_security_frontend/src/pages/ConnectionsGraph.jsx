import { useEffect, useState } from "react";
import { Graph } from "react-d3-graph";
import { getDeviceModels } from "../api/devices.api";
import { getConnectionGraph } from "../api/connections.api";

export function ConnectionsGraph({ highlightedPath = [] }) {
  const [device_models, setDeviceModels] = useState([]);
  const [connection_sources, setConnectionSource] = useState([]);
  const [connection_targets, setConnectionTarget] = useState([]);
  const [connection_labels, setConnectionLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [secondloading, secondSetLoading] = useState(true);

  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.9,
    height: window.innerHeight * 0.9,
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.9,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function loadDeviceModels() {
      try {
        const res = await getDeviceModels();
        const uniqueModels = [...new Set(res.data["models"])];
        setDeviceModels(uniqueModels);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching device models:", error);
        setLoading(false);
      }
    }
    loadDeviceModels();
  }, []);

  useEffect(() => {
    async function loadConnectionInfo() {
      try {
        const res = await getConnectionGraph();
        setConnectionSource(res.data["first_devices"]);
        setConnectionTarget(res.data["second_devices"]);
        setConnectionLabels(res.data["protocols"]);
        secondSetLoading(false);
      } catch (error) {
        console.error("Error fetching connection graph:", error);
        secondSetLoading(false);
      }
    }
    loadConnectionInfo();
  }, []);

  const nodes = device_models.map((name) => ({
    id: name,
    color: highlightedPath.includes(name) ? "red" : "white",
  }));

  const linkSet = new Set();
  const links = [];

  connection_sources.forEach((source, index) => {
    const target = connection_targets[index];
    const label = connection_labels[index];

    const isHighlighted =
      highlightedPath.includes(source) &&
      highlightedPath.includes(target) &&
      Math.abs(highlightedPath.indexOf(source) - highlightedPath.indexOf(target)) === 1;

    const key = `${source}-${target}-${label}`;
    if (!linkSet.has(key)) {
      linkSet.add(key);
      links.push({
        source,
        target,
        label,
        color: isHighlighted ? "red" : "white",
      });
    }
  });

  const graph_data = {
    nodes,
    links,
  };

  const config = {
    directed: false,
    panAndZoom: false,
    minZoom: 1,
    maxZoom: 1,
    staticGraph: false,
    automaticRearrangeAfterDropNode: true,
    collapsible: false,
    highlightDegree: 1,
    highlightOpacity: 0.2,
    linkHighlightBehavior: true,
    nodeHighlightBehavior: true,

    width: dimensions.width,
    height: dimensions.height,

    d3: {
      alphaTarget: 0.05,
      gravity: -300,
      linkLength: 200,
      linkStrength: 1,
    },
    node: {
      color: "white",
      fontColor: "white",
      fontSize: 14,
      fontWeight: "normal",
      highlightColor: "blue",
      highlightFontSize: 16,
      highlightFontWeight: "bold",
      highlightStrokeWidth: 1.5,
      mouseCursor: "pointer",
      opacity: 0.9,
      renderLabel: true,
      size: 700,
      strokeColor: "none",
      strokeWidth: 1.5,
      symbolType: "circle",
    },
    link: {
      color: "white",
      fontColor: "white",
      fontSize: 14,
      fontWeight: "normal",
      highlightColor: "blue",
      highlightFontSize: 16,
      highlightFontWeight: "bold",
      highlightStrokeWidth: 1.5,
      labelProperty: "label",
      mouseCursor: "pointer",
      opacity: 0.9,
      renderLabel: true,
      semanticStrokeWidth: true,
      strokeWidth: 1.5,
      markerHeight: 6,
      markerWidth: 6,
    },
  };

  const onClickNode = (nodeId) => {
    window.location.replace("/dashboard/" + nodeId);
  };

  const onClickLink = (source, target) => {
    window.alert(`Clicked link between ${source} and ${target}`);
  };

  return (
    <div className="page-back-graph">

      <div className="pt-12 flex items-center text-lightText text-sm mb-6">
        <a href="/" className="text-accent hover:text-secondary text-sm">
          Home Page
        </a>
        <span className="mx-2 text-sm"> &gt; </span>
        <a href="/graph" className="text-accent hover:text-secondary text-sm">
          Graph
        </a>
      </div>

      {(loading && secondloading) ? (
        <div className="text-center mt-20 text-xl">Loading graph...</div>
      ) : (
        <Graph
          id="graph-id"
          data={graph_data}
          config={config}
          onClickNode={onClickNode}
          onClickLink={onClickLink}
        />
      )}
    </div>
  );
}
