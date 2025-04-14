import React from "react";
import ProjectListComponent from "./components/ProjectListComponent";

export default function Settings() {
  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full lg:w-12/12 px-4">
          <ProjectListComponent />
        </div>
      </div>
    </>
  );
}
