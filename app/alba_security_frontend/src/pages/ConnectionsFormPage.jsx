import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  createConnection,
  deleteConnection,
  getConnection,
  updateConnection,
  getConnectionProtocols,
} from "../api/connections.api";
import { getDeviceModels } from "../api/devices.api";
import { toast } from "react-hot-toast";

export function ConnectionsFormPage() {
  const [isShown, setIsShown] = useState(false);
  const [device_models, setDeviceModels] = useState([]);
  const [conn_protocols, setConnProtocols] = useState([]);

  useEffect(() => {
    async function loadDeviceModels() {
      const res = await getDeviceModels();
      setDeviceModels(res.data["models"]);
    }
    loadDeviceModels();
  }, []);

  useEffect(() => {
    async function loadConnProtocols() {
      const res = await getConnectionProtocols();
      setConnProtocols(res.data["protocols"]);
    }
    loadConnProtocols();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const navigate = useNavigate();
  const params = useParams();

  const onSubmit = handleSubmit(async (data) => {
    setIsShown(true);

    if (params.id) {
      await updateConnection(params.id, data);
      toast.success("Connection updated", {
        position: "bottom-right",
        style: {
          background: "#101010",
          color: "#fff",
        },
      });
    } else {
      await createConnection(data);
      toast.success("New Connection Added", {
        position: "bottom-right",
        style: {
          background: "#101010",
          color: "#fff",
        },
      });
    }

    navigate("/connections");
  });

  useEffect(() => {
    async function loadConnection() {
      if (params.id) {
        const { data } = await getConnection(params.id);
        setValue("type", data.type);
        setValue("first_device", data.first_device.model);
        setValue("second_device", data.second_device.model);
      }
    }
    loadConnection();
  }, [params.id, setValue]);

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
        <span className="mx-2 text-sm"> &gt; </span>
        <a href="/connection-create" className="text-accent hover:text-secondary text-sm">
          Create Connection
        </a>
      </div>

      <form onSubmit={onSubmit} className="form-wrapper">
        <select {...register("type", { required: true })} className="input-base">
          {conn_protocols.map((protocol, index) => (
            <option key={index} value={protocol}>
              {protocol}
            </option>
          ))}
        </select>

        <select {...register("first_device", { required: true })} className="input-base">
          {device_models.map((model, index) => (
            <option key={index} value={model}>
              {model}
            </option>
          ))}
        </select>

        <select {...register("second_device", { required: true })} className="input-base">
          {device_models.map((model, index) => (
            <option key={index} value={model}>
              {model}
            </option>
          ))}
        </select>

        <div className="flex gap-4 mt-3">
          <button className="button-primary flex-1">Save</button>

          {params.id && (
            <button
              type="button"
              className="button-danger flex-1"
              onClick={async () => {
                const accepted = window.confirm("Are you sure?");
                if (accepted) {
                  await deleteConnection(params.id);
                  toast.success("Connection Removed", {
                    position: "bottom-right",
                    style: {
                      background: "#101010",
                      color: "#fff",
                    },
                  });
                  navigate("/connections");
                }
              }}
            >
              Delete
            </button>
          )}
        </div>
      </form>

      {isShown && (
        <div className="flex justify-center mt-6">
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}
