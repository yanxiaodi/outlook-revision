import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

// Initialize i18n
import "../i18n";

/* global document, Office, module, require, HTMLElement, console, process */

// Debug: Log environment variables at startup
console.log('=== Add-in Startup Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('REACT_APP_API_HOST:', process.env.REACT_APP_API_HOST);
console.log('============================');

const title = "Outlook ReVision Add-in";

const rootElement: HTMLElement | null = document.getElementById("container");
const root = rootElement ? createRoot(rootElement) : undefined;

/* Render application after Office initializes */
Office.onReady(() => {
  root?.render(
    <FluentProvider theme={webLightTheme}>
      <App title={title} />
    </FluentProvider>
  );
});

if ((module as any).hot) {
  (module as any).hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    root?.render(NextApp);
  });
}
