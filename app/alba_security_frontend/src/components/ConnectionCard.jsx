import { useNavigate } from "react-router-dom";

export function ConnectionCard({ connection }) {
  const navigate = useNavigate();

  return (
    <div
      className="card-item"
      onClick={() => navigate(`/connections/${connection.id}`)}
    >
      <h1 className="card-title">{connection.type}</h1>
      <p className="card-subtitle">{connection.first_device.model}</p>
      <p className="card-subtitle">{connection.second_device.model}</p>
    </div>
  );
}
