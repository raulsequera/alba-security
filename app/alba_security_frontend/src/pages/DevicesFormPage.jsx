import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { MdInfo } from "react-icons/md";
import {
  createDevice,
  deleteDevice,
  getDevice,
  updateDevice,
  getDeviceTypes,
  getDeviceCapabilities,
} from "../api/devices.api";
import { toast } from "react-hot-toast";

export function DevicesFormPage() {
  const [device_types, setDeviceTypes] = useState([]);
  const [device_capab, setDeviceCapab] = useState([]);
  const [isShown, setIsShown] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    async function loadDeviceTypes() {
      const res = await getDeviceTypes();
      setDeviceTypes(res.data["types"]);
    }
    loadDeviceTypes();
  }, []);

  useEffect(() => {
    async function loadDeviceCapab() {
      const res = await getDeviceCapabilities();
      setDeviceCapab(res.data["capabilities"]);
    }
    loadDeviceCapab();
  }, []);

  useEffect(() => {
    async function loadDevice() {
      if (params.id) {
        const { data } = await getDevice(params.id);
        setValue("model", data.model);
        setValue("type", data.type);
        setValue("category", data.category);
      }
    }
    loadDevice();
  }, [params.id, setValue]);

  const onSubmit = handleSubmit(async (data) => {
    setIsShown(true);

    if (params.id) {
      await updateDevice(params.id, data);
      toast.success("Device updated", {
        position: "bottom-right",
        style: { background: "#101010", color: "#fff" },
      });
    } else {
      await createDevice(data);
      toast.success("New Device Added", {
        position: "bottom-right",
        style: { background: "#101010", color: "#fff" },
      });
    }

    navigate("/devices");
  });

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
        <span className="mx-2 text-sm"> &gt; </span>
        <a href="/device-create" className="text-accent hover:text-secondary text-sm">
          Create Device
        </a>
      </div>
      <form onSubmit={onSubmit} className="form-wrapper">
        <input
          {...register("model", { required: true })}
          placeholder="Model"
          className="input-base"
        />

        <select {...register("type", { required: true })} className="input-base">
          {device_types.map((type, index) => (
            <option key={index} value={type}>{type}</option>
          ))}
        </select>

        <div className="relative">
          <select {...register("category", { required: true })} className="input-base">
            {device_capab.map((cap, index) => (
              <option key={index} value={cap}>{cap}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="absolute p-1 top-2 text-xl text-accent hover:text-secondary"
          >
            <MdInfo />
          </button>
        </div>

        <div className="flex gap-4 mt-3">
          <button className="button-primary flex-1">Save</button>

          {params.id && (
            <button
              type="button"
              className="button-danger flex-1"
              onClick={async () => {
                const accepted = window.confirm("Are you sure?");
                if (accepted) {
                  await deleteDevice(params.id);
                  toast.success("Device Removed", {
                    position: "bottom-right",
                    style: { background: "#101010", color: "#fff" },
                  });
                  navigate("/devices");
                }
              }}
            >
              Delete
            </button>
          )}
        </div>
      </form>

      {showInfo && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Device classes info</h3>
            <div className="border p-4 rounded-md bg-gray-100 shadow-md">
              <ul>
                <li><strong>Class 0:</strong> Extremely constrained devices. Cannot implement full security, require an intermediary node.</li>
                <li><strong>Class 1:</strong> Constrained devices, but capable of handling minimal security.</li>
                <li><strong>Class 2:</strong> Moderately resourced devices, able to implement robust security protocols.</li>
                <li><strong>Unconstrained:</strong> Devices with no significant limitations, can run full operating systems and advanced security protocols.</li>

              </ul>
            </div>
            <button
              className="button-close"
              onClick={() => setShowInfo(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}


      {isShown && (
        <div className="flex justify-center mt-6">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}
