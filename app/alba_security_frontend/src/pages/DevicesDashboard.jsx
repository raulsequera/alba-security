import { useEffect, useState } from "react";
import {
  getNdevNvuln,
  getAllDevices,
  getNSeveritySummaryList,
  getNSeveritySummary,
  getWeightedAverage,
  getAverageSustainability,
} from "../api/devices.api";
import BubbleChart from "./react-bubble-chart-d3";
import ReactApexChart from "react-apexcharts";

export function DevicesDashboard() {
  const [devices, setDevices] = useState([]);
  const [devices_list, setDeviceModel] = useState([]);
  const [vuln_list, setVuln] = useState([]);
  const [nvuln, setNvulns] = useState(0);
  const [ndev, setNdev] = useState(0);
  const [severity_summary_list, setNSeveritySummaryList] = useState({});
  const [severity_summary, setNSeveritySummary] = useState({});
  const [weighted_average, setWeightedAverage] = useState({});
  const [average_sustainability, setAverageSustainability] = useState(0);

  useEffect(() => {
    async function loadDevices() {
      const res = await getAllDevices();
      setDevices(res.data);
      setDeviceModel(res.data.map((d) => d.model));
      setVuln(res.data.map((d) => d.vulnerabilities));
    }
    loadDevices();
  }, []);

  useEffect(() => {
    async function fetchData() {
      const [wa, asus, ndevv, nsevList, nsev] = await Promise.all([
        getWeightedAverage(),
        getAverageSustainability(),
        getNdevNvuln(),
        getNSeveritySummaryList(),
        getNSeveritySummary(),
      ]);
      setWeightedAverage(wa.data);
      setAverageSustainability(asus.data?.AverageSustainability || 0);
      setNvulns(ndevv.data?.nvuln || 0);
      setNdev(ndevv.data?.ndev || 0);
      setNSeveritySummaryList(nsevList.data || {});
      setNSeveritySummary(nsev.data || {});
    }
    fetchData();
  }, []);

  const data_array = devices_list.map((label, i) => {
    const value = vuln_list[i]?.length || 0;
    let color = "#04e393";
    if (value >= 50) color = "#735cd3";
    else if (value >= 20) color = "#fa4363";
    else if (value >= 10) color = "#edb747";
    return { label, value, color };
  });

  const radialOptions = (level, color) => ({
    series: [
      Math.round(((severity_summary[level] || 0) / (severity_summary.total || 1)) * 100),
    ],
    options: {
      chart: { type: "radialBar", foreColor: "#fff", sparkline: { enabled: true } },
      title: {
        text: `${severity_summary[level] || 0} ${level.toUpperCase()}`,
        align: "center",
        floating: true,
      },
      plotOptions: {
        radialBar: {
          startAngle: -90,
          endAngle: 90,
          track: { background: "#706f70" },
          dataLabels: {
            value: { offsetY: -2, fontSize: "18px" },
            name: { show: false },
          },
        },
      },
      fill: { colors: [color], type: "solid" },
      labels: ["Average Results"],
    },
  });

  const stackedBarData = {
    series: ["none", "low", "medium", "high", "critical"].map((level) => ({
      name: level.toUpperCase(),
      data: severity_summary_list[level] || [],
    })),
    options: {
      chart: {
        background: "transparent",
        foreColor: "#fff",
        type: "bar",
        stacked: true,
        toolbar: { show: false }
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: "70%",
        },
      },
      stroke: { width: 1, colors: ["#000"] },
      xaxis: { categories: devices_list },
      yaxis: {
        labels: {
          style: {
            fontSize: "13px",
            fontFamily: "Arial",
            cssClass: "apexcharts-yaxis-label",
            lineHeight: 1.4,
          },
          minWidth: 200,
          maxWidth: 500,
          trim: false,
          formatter: (value) => {
            if (value.length > 15) return value.match(/.{1,12}/g).join("\n");
            return value;
          },
        },
      },
      legend: { position: "top", horizontalAlign: "left", offsetX: 30 },
      fill: { opacity: 1 },
      theme: { mode: "dark" },
    },
  };

  return (
    <div className="page-back space-y-6">
      <div className="flex items-center text-lightText text-sm mb-6">
        <a href="/" className="text-accent hover:text-secondary text-sm"> 
        Home Page
        </a>
        <span className="mx-2 text-sm"> &gt; </span> 
        <a href="/dashboard" className="text-accent hover:text-secondary text-sm">
        Dashboard
        </a>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 mt-10 px-4 py-6 rounded-xl shadow-xl bg-white/5 backdrop-blur-md border border-white/10 justify-center">
        <Card title="Nº Devices" value={ndev} />
        <Card title="Nº Vulnerable" value={nvuln} />
        <Card title="Nº Vulnerabilities" value={severity_summary.total || 0} />
        <Card title="Average" value={weighted_average.WeightedAverage?.toFixed(2) || "-"} />
        <Card title="Sustainability" value={(average_sustainability ?? 0).toFixed(2)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex justify-center lg:justify-end lg:pr-24">
          <BubbleChart
            graph={{ zoom: 1, offsetX: 0, offsetY: 0 }}
            width={Math.min(window.innerWidth - 40, 400)}
            height={Math.min(window.innerWidth - 40, 400)}
            padding={0}
            showLegend={false}
            valueFont={{ family: "Arial", size: 12, color: "#fff", weight: "bold" }}
            labelFont={{ family: "Arial", size: 16, color: "#fff", weight: "bold" }}
            bubbleClickFunc={() => console.log("bubble click")}
            legendClickFun={() => console.log("legend click")}
            data={data_array}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-4">
          <ReactApexChart {...radialOptions("low", "#04e393")} type="radialBar" height={250} />
          <ReactApexChart {...radialOptions("medium", "#edb747")} type="radialBar" height={250} />
          <ReactApexChart {...radialOptions("high", "#fa4363")} type="radialBar" height={250} />
          <ReactApexChart {...radialOptions("critical", "#735cd3")} type="radialBar" height={250} />
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto">
        <ReactApexChart
          options={stackedBarData.options}
          series={stackedBarData.series}
          type="bar"
          height={400}
          width="100%"
        />
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="card text-center">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-lg font-bold mt-1">{value ?? "-"}</p>
    </div>
  );
}
