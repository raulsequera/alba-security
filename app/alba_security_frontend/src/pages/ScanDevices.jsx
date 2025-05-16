import React, { useState } from "react";
import { getScanStarted } from "../api/devices.api";
import { ConnectionsGraph } from "./ConnectionsGraph";

export function ScanDevices() {
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const [conexiones, setConexiones] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);

  const handleScan = async () => {
    if (loading) return;
    setLoading(true);
    setOutput("Scanning network...");

    try {
      const response = await getScanStarted();
      if (response.data.status === "success") {
        const rawOutput = response.data.output;
        const lines = rawOutput.split("\n");

        // Enviar errores al console.log
        const errorIndex = lines.findIndex(line => line.startsWith("Error Output"));
        const relevantLines = errorIndex !== -1 ? lines.slice(0, errorIndex) : lines;
        const errorLines = errorIndex !== -1 ? lines.slice(errorIndex) : [];

        if (errorLines.length > 0) {
          console.log("Error Output:\n", errorLines.join("\n"));
        }

        // Omitir la primera línea que solo interesa para Import
        const newOutput = relevantLines.slice(1).join("\n");
        setOutput(newOutput);

        const conexionesTemp = [];

        relevantLines.forEach((linea) => {
          const match = linea.match(/(.+?) connected to (.+?) \| Trace: (.+)/);
          if (match) {
            const [, dispositivo, destino, rastro] = match;
            conexionesTemp.push({
              dispositivo: dispositivo.trim(),
              destino: destino.trim(),
              rutaIP: rastro.split("->").map((ip) => ip.trim()),
              rutaNombres: [],
            });
          }
        });

        let ipIndex = 0;
        relevantLines.forEach((linea) => {
          if (linea.startsWith("INTERNAMES:")) {
            const rawNames = linea.replace("INTERNAMES:", "").trim();
            const listNames = rawNames.split("->").map((name) => name.trim());
            if (conexionesTemp[ipIndex]) {
              conexionesTemp[ipIndex].rutaNombres = listNames;
            }
            ipIndex++;
          }
        });

        setConexiones(conexionesTemp);
      } else {
        setOutput((prev) => prev + "Error: Scan could not be started.\n");
      }
    } catch (error) {
      setOutput((prev) => prev + `Error starting: ${error.message}\n`);
    } finally {
      setLoading(false);
    }
  };


  const handleDownloadLog = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "scan_output.txt";
    link.click();
  };

  return (
    <div className="page-back">
      <div className="flex items-center text-lightText text-sm mb-6">
        <a href="/" className="text-accent hover:text-secondary text-sm">
          Home Page
        </a>
        <span className="mx-2 text-sm"> &gt; </span>
        <a href="/scan-devices" className="text-accent hover:text-secondary text-sm">
          Scan Devices
        </a>
      </div>
      <div className="scan-wrapper">
        <h2 className="text-3xl font-bold">SCAN DEVICES</h2>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handleScan}
            disabled={loading}
            className="button-primary"
          >
            {loading ? "Scanning..." : "Start Scan"}
          </button>

          <button
            onClick={handleDownloadLog}
            className="button-primary"
            disabled={loading || !output}
          >
            Download Log
          </button>
        </div>

        <pre className="output-terminal">
          {output}
        </pre>

        {conexiones.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-3">Connections detected:</h3>
            <ul className="space-y-2">
              {conexiones.map((c, index) => (
                <li
                  key={index}
                  className="connection-item"
                >
                  <div>
                    <strong>{c.dispositivo}</strong> → {c.destino}
                  </div>
                  <button
                    onClick={async () => {
                      if (c.rutaNombres.length > 0) {
                        setRutaSeleccionada(c.rutaNombres);
                      } else {
                        setRutaSeleccionada(c.rutaIP);
                      }
                    }}
                    className="button-mapa"
                  >
                    See on map
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {rutaSeleccionada && (
          <div
            className="mt-8 mx-auto rounded-lg "
            style={{ maxWidth: "100%", maxHeight: "500px", overflow: "auto" }}
          >
            <div className="connection-item" style={{ minWidth: "1465px" }}>
              <ConnectionsGraph highlightedPath={rutaSeleccionada} />
            </div>
            <button onClick={() => setRutaSeleccionada(null)}
              className="button-closemap">
              Close map
            </button>
          </div>

        )}

      </div>
    </div>
  );
}
