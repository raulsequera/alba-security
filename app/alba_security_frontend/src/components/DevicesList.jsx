import { useEffect, useState } from "react";
import { Link } from "react-router-dom";  
import { getAllDevices } from "../api/devices.api";
import { DeviceCard } from "./DeviceCard";

export function DevicesList({ currentPage, devicesPerPage, searchTerm, setTotalDevices, viewMode }) {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    async function loadDevices() {
      const res = await getAllDevices();
      setDevices(res.data);
      setTotalDevices(res.data.length);
    }
    loadDevices();
  }, [setTotalDevices]);
 
  const filteredDevices = devices.filter(device =>
    device.model && device.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastDevice = currentPage * devicesPerPage;
  const indexOfFirstDevice = indexOfLastDevice - devicesPerPage;
  const currentDevices = filteredDevices.slice(indexOfFirstDevice, indexOfLastDevice);

  return (
    <div className={`card-grid ${viewMode === "list" ? "list-view" : ""}`}>
      {currentDevices.map((device) => (
        viewMode === "panel" ? (
          <DeviceCard key={device.id} device={device} />
        ) : (
          <Link key={device.id} to={`/devices/${device.id}`} className="card-item list-view">
            <h3 className="text-lg font-bold uppercase">{device.model}</h3>
            <p className="text-sm text-gray-500">{device.type}</p>
          </Link>
        )
      ))}
    </div>
  );
}
