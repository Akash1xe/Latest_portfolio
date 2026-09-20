import React from "react";

import { profile } from "@/data/profile";

interface BasicPortfolioProps {
  layoutBroken: boolean;
}

/**
 * BasicPortfolio Component
 *
 * This component displays a basic portfolio layout with information about the developer, their skills, projects, and contact details.
 * It includes a conditional class for layout breaking, which can be used to dynamically change the layout based on certain conditions.
 *
 * Props:
 * - layoutBroken: A boolean indicating whether the layout should be broken or not.
 *
 * The component includes the following sections:
 * - A personal section with a photo, name, and profession.
 * - An about section with a brief description.
 * - A skills section listing the developer's skills.
 * - A projects section with brief descriptions of three projects.
 * - A contact section with email and phone number.
 *
 * This component is designed to provide a simple and easy-to-use interface for displaying a developer's portfolio.
 */
const BasicPortfolio: React.FC<BasicPortfolioProps> = ({ layoutBroken }) => {
  return (
    <div
      className={`relative z-10 max-w-4xl mx-auto transition-transform duration-300 ${
        layoutBroken ? "layout-broken" : ""
      }`}
    >
      <img
        src={profile.avatarUrl}
        alt={profile.name}
        className="w-20 h-20 rounded-lg mb-5"
      />
      <h1 className="text-2xl font-serif">{profile.name}</h1>
      <p className="text-base font-serif">{profile.role}</p>

      <hr className="my-4" />

      <h2 className="text-xl font-serif mt-5 font-bold">About Me</h2>
      <p className="text-base font-serif mb-3">
        I build scalable backend systems, real-time products, and practical
        developer experiences.
      </p>

      <h2 className="text-xl font-serif mt-5 font-bold">Skills</h2>
      <ul className="list-disc ml-6 mb-3">
        <li className="mb-1">C++</li>
        <li className="mb-1">JavaScript</li>
        <li className="mb-1">Node.js, Express, and FastAPI</li>
      </ul>

      <h2 className="text-xl font-serif mt-5 font-bold">Projects</h2>

      {/* Broken images section */}
      <div className="project-section">
        <h3 className="text-lg font-serif mt-4 font-bold">Project 1</h3>
        <p className="text-base font-serif mb-2">
          BidX — a real-time auction platform.
        </p>

        <h3 className="text-lg font-serif mt-4 font-bold">Project 2</h3>
        <p className="text-base font-serif mb-2">SafeRoute — safety-aware route planning.</p>

        <h3 className="text-lg font-serif mt-4 font-bold">Project 3</h3>
        <p className="text-base font-serif mb-2">Samvid — a civic-tech web product.</p>
      </div>

      <h2 className="text-xl font-serif mt-5 font-bold">Find Me</h2>
      <a className="text-base font-serif mb-3" href={profile.githubUrl}>
        {profile.githubLabel}
      </a>
    </div>
  );
};

export default BasicPortfolio;
