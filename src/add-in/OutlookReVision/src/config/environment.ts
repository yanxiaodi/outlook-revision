// Environment configuration
/* global process, console */
// API host is configured at build time via environment variables

export interface EnvironmentConfig {
  apiHost: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

// Resolve API host from environment variables
const resolveApiHost = (): string => {
  // API host is injected at build time by webpack.DefinePlugin
  // See webpack.config.js for configuration
  
  // webpack.DefinePlugin replaces process.env.REACT_APP_API_HOST with the actual string value
  // So we directly access it and check if it's a non-empty string
  const apiHost = process.env.REACT_APP_API_HOST || "";
  
  console.log("resolveApiHost - Raw value:", apiHost);
  console.log("resolveApiHost - Type:", typeof apiHost);
  console.log("resolveApiHost - Length:", apiHost.length);
  
  if (apiHost && apiHost.length > 0) {
    console.log("✅ REACT_APP_API_HOST configured:", apiHost);
    return apiHost;
  }

  // When not set, return empty string to use relative URLs with webpack-dev-server proxy
  console.log("⚠️ REACT_APP_API_HOST not set, using relative URLs (will be proxied by webpack-dev-server)");
  return "";
};

const getNodeEnv = (): string => {
  return typeof process !== "undefined" && process.env && process.env.NODE_ENV
    ? process.env.NODE_ENV
    : "development";
};

export const ENVIRONMENT_CONFIG: EnvironmentConfig = {
  apiHost: resolveApiHost(),
  isDevelopment: getNodeEnv() === "development",
  isProduction: getNodeEnv() === "production",
};

// Helper function to get the API host
export const getApiHost = (): string => {
  return ENVIRONMENT_CONFIG.apiHost;
};
