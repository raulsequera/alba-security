import { useState } from "react";
import { getDevices } from "../api/devices.api";

export function ImportDevices() {
    const initialOutput = `
        <ul>
            <li><strong>Devices will be imported from Home Assistant.</strong></li>
            <li><strong>Make sure you have Home Assistant server running.</strong></li>
            <li><strong>All the integrations you have in Home Assistant will be imported.</strong></li>
            <li><strong>It is not necessary to have your devices ON (That is just for 'Scan Devices').</strong></li>
        </ul>`;
    const [output, setOutput] = useState(initialOutput);
    const [loading, setLoading] = useState(false);

    const handleGetDevices = async () => {
        setLoading(true);
        try {
            const response = await getDevices();
            if (response.status === 200) {
                setOutput(`<strong>${response.data.output}</strong>`); 
            }
        } catch (error) {
            console.error("Error during Get Devices");
            setOutput("<p><strong>An error occurred while importing devices.</strong></p>"); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-back">
            <div className="flex items-center text-lightText text-sm mb-6">
                <a href="/" className="text-accent hover:text-secondary text-sm">
                    Home Page
                </a>
                <span className="mx-2 text-sm"> &gt; </span>
                <a href="/get-devices" className="text-accent hover:text-secondary text-sm">
                    Import Devices
                </a>
            </div>
            <div className="scan-wrapper">
                <h2 className="text-3xl font-bold">IMPORT DEVICES</h2>

                <div className="flex justify-between items-center mb-4">
                    <button
                        onClick={handleGetDevices}
                        disabled={loading}
                        className="button-primary"
                    >
                        {loading ? "Import in progress..." : "Import"}
                    </button>
                </div>
                <div className="bg-blue10">
                    <div className="border p-3 rounded-md bg-gray-100 shadow-md text-black">
                        <div dangerouslySetInnerHTML={{ __html: output }} />
                    </div>
                </div>
            </div>
        </div>
    );
}