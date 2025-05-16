import React from "react";
import securityImage from "../assets/security-image.png";

export function HomePage () {
  return (
    <div className="page-back relative min-h-screen bg-background py-10 px-6">
      <div className="flex items-center text-lightText text-sm mb-6">
        <a href="/" className="text-accent hover:text-secondary text-sm"> 
        Home Page
        </a>
      </div>

      <header className="text-center max-w-4xl mx-auto mt-10">
        <h1 className="text-5xl font-bold leading-tight mb-4 tracking-wide">
          Smart security for your IoT Home.
        </h1>
        <p className="text-lg text-lightText mb-6 max-w-xl mx-auto">
          Protect and monitor your IoT infraestructure in Home Assistant with advanced security tools.
        </p>
      </header>

      <section className="card-item my-10 px-6 py-10 max-w-6xl mx-auto text-center">
        <img
          src={securityImage}
          alt="IoT Security"
          className="mx-auto mb-6 w-full max-w-lg rounded-xl shadow-lg"
        />
      </section>


      <section className=" my-10 px-6 py-10 max-w-6xl mx-auto text-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              title: "Smart Detection",
              text: "Automatically detects IoT devices on your network and assesses their security.",
            },
            {
              title: "Real-Time Security",
              text: "Monitors vulnerabilities and threats instantly to keep your home safe.",
            },
            {
              title: "Home Assistant Integration",
              text: "Perfect integration with Home Assistant for total control from a single platform.",
            }
            ,
          ].map(({ title, text }) => (
            <div
              key={title}
              className="bg-zinc-800/80 p-6 rounded-xl shadow hover:shadow-xl transition"
            >
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-lightText text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-sm text-gray-500 py-4">
        &copy; 2025 Alba Security. All rights reserved.
      </footer>
    </div>
  );
}; 