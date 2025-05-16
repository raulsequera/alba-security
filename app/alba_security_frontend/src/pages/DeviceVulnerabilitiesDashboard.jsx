import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import {
  getVulnerabilities,
  getVulnerability,
  getDeviceWeightedAverage,
  getDeviceSustainability,
} from "../api/devices.api";
import BubbleChart from "./react-bubble-chart-d3-vuln";
import ReactApexChart from "react-apexcharts";

export function DeviceVulnerabilitiesDashboard() {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [vulnerability, setVulnerability] = useState([]);
  const [device_weighted_average, setDeviceWeightedAverage] = useState([]);
  const [device_sustainability, setDeviceSustainability] = useState([]);
  const params = useParams();

  useEffect(() => {
    async function loadAll() {
      const [vulnsRes, singleVulnRes, avgRes, susRes] = await Promise.all([
        getVulnerabilities(params.id),
        getVulnerability(params.vuln_id),
        getDeviceWeightedAverage(params.id),
        getDeviceSustainability(params.id),
      ]);
      setVulnerabilities(vulnsRes.data);
      setVulnerability(singleVulnRes.data);
      setDeviceWeightedAverage(avgRes.data);
      setDeviceSustainability(susRes.data["DeviceSustainability"]);
    }
    loadAll();
  }, [params.id, params.vuln_id]);

  const vulnerabilities_names = Object.keys(vulnerabilities);
  const vulnerabilities_descriptions = {};
  const vulnerabilities_cvss_vuln = {};
  const vulnerabilities_cvss = [];

  for (let name of vulnerabilities_names) {
    vulnerabilities_descriptions[name] = vulnerabilities[name].description;
    vulnerabilities_cvss_vuln[name] = vulnerabilities[name].cvss;
    vulnerabilities_cvss.push(vulnerabilities[name].cvss);
  }

  const data_array = vulnerabilities_names.map((name, i) => {
    const score = vulnerabilities_cvss[i];
    let color = "#fff";
    if (score >= 0.1 && score <= 3.9) color = "#04e393";
    if (score >= 4 && score <= 6.9) color = "#edb747";
    if (score >= 7 && score <= 8.9) color = "#fa4363";
    if (score >= 9 && score <= 10) color = "#735cd3";
    return { label: name, value: score, color };
  });

  const categories =
    vulnerability.vector_version === 3
      ? ["AV", "AC", "PR", "UI", "C", "I", "A"]
      : ["AV", "AC", "AU", "C", "I", "A"];

  const radar_data = {
    series: [
      {
        name: "Vector",
        data: vulnerability.numeric_vector,
      },
    ],
    options: {
      chart: {
        height: 150,
        type: "radar",
        toolbar: { show: false },
        background: "transparent",
      },
      dataLabels: { enabled: true },
      plotOptions: {
        radar: {
          size: 150,
          polygons: {
            strokeColors: "#ccc",
            fill: { colors: ["#111", "#222"] },
          },
        },
      },
      colors: ["#22D3EE"],
      markers: {
        size: 4,
        colors: ["#fff"],
        strokeColor: "#22D3EE",
        strokeWidth: 2,
      },
      tooltip: {
        y: { formatter: (val) => val },
      },
      xaxis: { categories },
      yaxis: {
        tickAmount: 5,
        labels: {
          formatter: (val) => val.toFixed(1),
        },
      },
    },
  };

  return (
    <div className="page-back space-y-6 py-10 px-4">
      <div className="flex items-center text-lightText text-sm mb-6">
        <a href="/" className="text-accent hover:text-secondary text-sm"> 
        Home Page
        </a>
        <span className="mx-2 text-sm"> &gt; </span> 
        <a href="/dashboard" className="text-accent hover:text-secondary text-sm">
        Dashboard
        </a>
        <span className="mx-2 text-sm"> &gt; </span> 
        <span className="text-accent hover:text-secondary text-sm">Vulnerabilities</span>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-between w-full gap-4 bg-zinc-800/80 p-4 rounded-xl">
        <div className="tag-pill">{params.id}</div>

        <div className="card grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
          <MetricCard title="Average" value={
            Math.round(device_weighted_average.DeviceWeightedAverage * 100) / 100 || "-"
          } />
          <MetricCard title="Sustainability" value={device_sustainability} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-center items-center gap-12 w-full">
        <div className="flex w-full lg:w-2/3 justify-end pr-32">
          <BubbleChart
            graph={{ zoom: 1, offsetX: 0, offsetY: 0 }}
            width={570}
            height={570}
            padding={0}
            showLegend={false}
            valueFont={{
              family: "Arial",
              size: 12,
              color: "#fff",
              weight: "bold",
            }}
            labelFont={{
              family: "Arial",
              size: 16,
              color: "#fff",
              weight: "bold",
            }}
            data={data_array}
          />
        </div>

        <div className="w-full max-w-xl flex justify-center items-center">
          <ReactApexChart
            options={radar_data.options}
            series={radar_data.series}
            type="radar"
            height={550}
          />
        </div>
      </div>

      <div className="card-section bg-zinc-800/80 p-4 rounded-xl space-y-2">
        <p className="font-semibold">ID: {vulnerability.id}</p>
        <p className="font-semibold">CVSS Version: {vulnerability.version}</p>
        <p className="font-semibold">Vector: {vulnerability.vector}</p>
        <p className="font-semibold">Description: {vulnerability.description}</p>
        <p className="font-semibold">Severity: {vulnerability.baseSeverity}</p>
        <p className="font-semibold">Base Score: {vulnerability.cvss}</p>
        <p className="font-semibold">
          Explotability Score: {vulnerability.explotability}
        </p>
        <p className="font-semibold">Impact Score: {vulnerability.impact}</p>
        <p className="font-semibold">CWE: {vulnerability.cwe}</p>
      </div>

      <div className="card-section bg-zinc-800/80 p-4 rounded-xl h-96 overflow-y-auto space-y-4">
        {vulnerabilities_names.map((name) => (
          <a
            key={name}
            href={`/dashboard/${params.id}/${name}`}
            className="block p-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition"
          >
            <div className="flex justify-between items-center">
              <p className="font-semibold text-white">{name}</p>
              <span className="bg-gray-300 text-black px-2 py-1 rounded text-sm">
                CVSS: {vulnerabilities_cvss_vuln[name]}
              </span>
            </div>
            <p className="text-white text-sm mt-1">
              {vulnerabilities_descriptions[name]}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="card text-center flex flex-col items-center justify-center">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="text-lg font-bold mt-1">{value ?? "-"}</p>
    </div>
  );
}
