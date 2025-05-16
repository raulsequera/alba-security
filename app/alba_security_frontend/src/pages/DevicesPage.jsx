import { useState } from "react";
import { DevicesList } from "../components/DevicesList";
import { MdViewList, MdViewModule } from "react-icons/md";

export function DevicesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const devicesPerPage = 9;
  const [searchTerm, setSearchTerm] = useState("");
  const [totalDevices, setTotalDevices] = useState(0);
  const [viewMode, setViewMode] = useState("panel");
  const [allDevices, setAllDevices] = useState([]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const totalPages = Math.ceil(totalDevices / devicesPerPage);

  const toggleViewMode = () => {
    setViewMode(viewMode === "panel" ? "list" : "panel");
  };

  const filteredDevices = allDevices.filter(device =>
    device.model && device.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-back">
      <div className="flex items-center text-lightText text-sm mb-6">
        <a href="/" className="text-accent hover:text-secondary text-sm"> 
        Home Page
        </a>
        <span className="mx-2 text-sm"> &gt; </span> 
        <a href="/devices" className="text-accent hover:text-secondary text-sm">
        Devices
        </a>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-center">Connected Devices</h1>

      <div className="flex justify-center items-center mb-6">
        <input
          type="text"
          placeholder="Search Devices"
          value={searchTerm}
          onChange={handleSearch}
          className="button-primary w-full max-w-lg"
        />

        <button
          onClick={toggleViewMode}
          className="button-primary ml-4"
        >
          {viewMode === "panel" ? (
            <MdViewList className="text-xl" />
          ) : (
            <MdViewModule className="text-xl" />
          )}
        </button>
      </div>

      <DevicesList
        currentPage={currentPage}
        devicesPerPage={devicesPerPage}
        searchTerm={searchTerm}
        setTotalDevices={setTotalDevices}
        viewMode={viewMode}
        devices={filteredDevices}
      />

      <div className="flex justify-center items-center mt-6">
        {currentPage > 1 && (
          <button
            onClick={() => paginate(currentPage - 1)}
            className="button-primary mx-2"
          >
            Previous
          </button>
        )}

        <span className="mx-2 text-sm text-lightText">
          {currentPage} of {totalPages}
        </span>

        {currentPage < totalPages && (
          <button
            onClick={() => paginate(currentPage + 1)}
            className="button-primary mx-2"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
