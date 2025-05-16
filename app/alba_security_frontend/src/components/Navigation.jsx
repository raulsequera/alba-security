import { useState } from "react";
import { Link } from "react-router-dom";
import { getDevices } from "../api/devices.api";

export function Navigation() {
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const handleGetDevices = async () => {
    setLoading(true);
    try {
      const response = await getDevices();
      if (response.status === 200) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error during Get Devices");
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-background shadow-md text-lightText px-6 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link to="/" className="flex items-center">
          <img
            src="/src/assets/logoalba.png"
            alt="Alba Security"
            className="h-10 w-auto"
          />
        </Link>

        <div className="flex flex-wrap gap-4 relative">
          <Dropdown
            label="Devices"
            open={openMenu === "devices"}
            setOpen={() => setOpenMenu(openMenu === "devices" ? null : "devices")}
          >
            <DropdownItem to="/devices" label="Devices" />
            <DropdownItem to="/get-devices" label="Import Devices" />
            <DropdownItem to="/device-create" label="Create Device" />
            <DropdownItem to="/scan-devices" label="Scan Devices" />

          </Dropdown>

          <Dropdown
            label="Connections"
            open={openMenu === "connections"}
            setOpen={() => setOpenMenu(openMenu === "connections" ? null : "connections")}
          >
            <DropdownItem to="/connections" label="Connections" />
            <DropdownItem to="/connection-create" label="Create Connection" />
            <DropdownItem to="/graph" label="Graph" />
          </Dropdown>

          <Link to="/dashboard" className="nav-button">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Dropdown({ label, children, open, setOpen }) {
  return (
    <div className="relative">
      <button onClick={setOpen} className="nav-button">
        {label}
        <span
          className={`text-sm transition-transform duration-200 ${
            open ? "rotate-90 scale-110" : ""
          }`}
        >
          ≡
        </span>
      </button>

      <div className={`dropdown-panel ${open ? "dropdown-panel--open" : "dropdown-panel--closed"}`}>
        <div className="py-2">{children}</div>
      </div>
    </div>
  );
}

function DropdownItem({ to, label, onClick, disabled = false }) {
  const base =
    "block w-full text-left px-4 py-2 text-sm text-lightText hover:bg-white/10 transition";

  if (to) {
    return <Link to={to} className={base}>{label}</Link>;
  }

  return (
    <button
      className={`${base} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}
