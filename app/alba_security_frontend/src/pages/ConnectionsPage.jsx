import { useState } from "react";
import { ConnectionsList } from "../components/ConnectionsList";
import { MdViewList, MdViewModule } from "react-icons/md";

export function ConnectionsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const connectionsPerPage = 9;
  const [searchTerm, setSearchTerm] = useState("");
  const [totalConnections, setTotalConnections] = useState(0);
  const [viewMode, setViewMode] = useState("panel");
  const [allConnections, setAllConnections] = useState([]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const handleSearch = (e) => setSearchTerm(e.target.value);
  const totalPages = Math.ceil(totalConnections / connectionsPerPage);

  const toggleViewMode = () => {
    setViewMode(viewMode === "panel" ? "list" : "panel");
  };

  const filteredConnections = allConnections.filter(connection =>
    (connection.first_device.model && connection.first_device.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (connection.second_device.model && connection.second_device.model.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-back">
      <div className="flex items-center text-lightText text-sm mb-6">
        <a href="/" className="text-accent hover:text-secondary text-sm">
          Home Page
        </a>
        <span className="mx-2 text-sm"> &gt; </span>
        <a href="/connections" className="text-accent hover:text-secondary text-sm">
          Connections
        </a>
      </div>
      <h1 className="text-3xl font-bold mb-8 text-center">Connections</h1>

      <div className="flex justify-center items-center mb-6">
        <input
          type="text"
          placeholder="Search Connections"
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

      <ConnectionsList
        currentPage={currentPage}
        connectionsPerPage={connectionsPerPage}
        searchTerm={searchTerm}
        setTotalConnections={setTotalConnections}
        viewMode={viewMode}
        connections={filteredConnections}
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
