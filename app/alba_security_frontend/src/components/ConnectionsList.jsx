import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import { getAllConnections } from "../api/connections.api";
import { ConnectionCard } from "./ConnectionCard";

export function ConnectionsList({ currentPage, connectionsPerPage, searchTerm, setTotalConnections, viewMode }) {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    async function loadConnections() {
      const res = await getAllConnections();
      setConnections(res.data);
      setTotalConnections(res.data.length);
    }
    loadConnections();
  }, [setTotalConnections]);

  const filteredConnections = connections.filter(connection =>
    connection.first_device.model && connection.first_device.model.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  const indexOfLastConnection = currentPage * connectionsPerPage;
  const indexOfFirstConnection = indexOfLastConnection - connectionsPerPage;
  const currentConnections = filteredConnections.slice(indexOfFirstConnection, indexOfLastConnection);

  return (
    <div className={`card-grid ${viewMode === "list" ? "list-view" : ""}`}>
      {currentConnections.map((connection) => (
        viewMode === "panel" ? (
          <ConnectionCard key={connection.id} connection={connection} />
        ) : (
          <Link key={connection.id} to={`/connections/${connection.id}`} className="card-item list-view">
            <h3 className="text-lg font-bold">{connection.type}</h3>
            <p className="text-sm text-gray-500">{connection.first_device.model}</p>
            <p className="text-sm text-gray-500">{connection.second_device.model}</p>
          </Link>
        )
      ))}
    </div>
  );
}
