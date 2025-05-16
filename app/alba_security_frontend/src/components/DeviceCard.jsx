import { useNavigate } from "react-router-dom";

export function DeviceCard({ device }) {
  const navigate = useNavigate();

  return (
    <div
      className="card-item"
      onClick={() => navigate(`/devices/${device.id}`)}
    >
      <h1 className="card-title">{device.model}</h1>
      <p className="card-subtitle mt-subtitle">{device.type}</p>
    </div>
  );
}
