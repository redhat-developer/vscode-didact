import * as React from "react";
import * as ReactDOM from "react-dom";

import "./index.css";
import { QuickStartsPreview } from "./quickstarts";

declare global {
  interface Window {
    acquireVsCodeApi(): () => void;
    initialData: string;
    filePath: string;
  }
}

// const vscode = window.acquireVsCodeApi();

ReactDOM.render(
  <QuickStartsPreview /*vscode={vscode}*/ initialData={window.initialData} filePath={window.filePath} />,
  document.getElementById("root")
);
