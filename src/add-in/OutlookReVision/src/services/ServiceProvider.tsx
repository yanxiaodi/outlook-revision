// ServiceProvider.tsx - Context provider for switching between mock and real services

import React, { createContext, useContext, useEffect, useState } from "react";
import { makeStyles } from "@fluentui/react-components";
import { IOutlookService } from "./OutlookService";
import { RealOutlookService } from "./RealOutlookService";
import { MockOutlookService, MockTestScenarios } from "./MockOutlookService";
import { IReVisionService } from "./ReVisionService";
import { RealReVisionService } from "./RealReVisionService";
import { MockReVisionService } from "./MockReVisionService";
import { getApiHost } from "../config/environment";

/* global Office */

interface ServiceContextType {
  outlookService: IOutlookService;
  reVisionService: IReVisionService;
  isRunningInOutlook: boolean;
  isMockMode: boolean;
  mockService?: MockOutlookService;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

interface ServiceProviderProps {
  children: React.ReactNode;
  forceMockMode?: boolean; // For testing purposes
}

const useLoadingStyles = makeStyles({
  container: {
    padding: "20px",
    textAlign: "center",
  },
});

const useDevToolsStyles = makeStyles({
  container: {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    backgroundColor: "#f0f0f0",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "8px",
    fontSize: "12px",
    zIndex: "9999",
    maxWidth: "300px",
  },
  header: {
    cursor: "pointer",
    fontWeight: "bold",
  },
  headerExpanded: {
    cursor: "pointer",
    fontWeight: "bold",
    marginBottom: "8px",
  },
  buttonContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  button: {
    padding: "4px",
    fontSize: "11px",
  },
});

interface ServiceProviderProps {
  children: React.ReactNode;
  forceMockMode?: boolean; // For testing purposes
}

/**
 * Service provider that automatically detects whether we're running in Outlook
 * and provides the appropriate service implementation
 */
export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
  forceMockMode = false,
}) => {
  const [serviceContext, setServiceContext] = useState<ServiceContextType | null>(null);
  const loadingStyles = useLoadingStyles();

  useEffect(() => {
    const initializeServices = () => {
      // Check if we're running in Outlook
      const isRunningInOutlook =
        !forceMockMode &&
        typeof Office !== "undefined" &&
        Office.context &&
        Office.context.mailbox &&
        Office.context.mailbox.item !== null;

      let outlookService: IOutlookService;
      let reVisionService: IReVisionService;
      let mockService: MockOutlookService | undefined;

      if (isRunningInOutlook) {
        console.log(
          "ServiceProvider: Initializing with RealOutlookService and RealReVisionService"
        );
        // Get API host from environment configuration
        const apiHost = getApiHost();
        console.log(`ServiceProvider: API Host = ${apiHost}`);
        outlookService = new RealOutlookService();
        reVisionService = new RealReVisionService(apiHost);
      } else {
        console.log(
          "ServiceProvider: Initializing with MockOutlookService and RealReVisionService (Browser Mode)"
        );

        // In browser mode, use MockOutlookService for Outlook APIs but RealReVisionService for backend API
        const apiHost = getApiHost();
        console.log(`ServiceProvider: API Host = ${apiHost}`);

        mockService = new MockOutlookService();
        outlookService = mockService;
        reVisionService = new RealReVisionService(apiHost); // Use real service to test against real API

        // Set up some interesting mock scenarios for development
        if (process.env.NODE_ENV === "development") {
          setupDevelopmentMockScenarios(mockService);
        }
      }

      setServiceContext({
        outlookService,
        reVisionService,
        isRunningInOutlook,
        isMockMode: !isRunningInOutlook,
        mockService,
      });
    };

    // If Office.js is available, wait for it to be ready
    if (typeof Office !== "undefined" && !forceMockMode) {
      if (Office.context) {
        // Office is already initialized
        initializeServices();
      } else {
        // Wait for Office to initialize
        Office.onReady(() => {
          initializeServices();
        });
      }
    } else {
      // Running in browser or forced mock mode
      initializeServices();
    }
  }, [forceMockMode]);

  if (!serviceContext) {
    return (
      <div className={loadingStyles.container}>
        <div>Initializing services...</div>
      </div>
    );
  }

  return (
    <ServiceContext.Provider value={serviceContext}>
      {children}
      {/* Development tools for mock mode */}
      {process.env.NODE_ENV === "development" && serviceContext.isMockMode && (
        <MockModeDevTools mockService={serviceContext.mockService!} />
      )}
    </ServiceContext.Provider>
  );
};

/**
 * Hook to access the service context
 * Throws an error if used outside of ServiceProvider
 */
export const useServices = (): ServiceContextType => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return context;
};

/**
 * Hook to get just the Outlook service
 */
export const useOutlookService = (): IOutlookService => {
  const { outlookService } = useServices();
  return outlookService;
};

/**
 * Hook to get just the ReVision service
 */
export const useReVisionService = (): IReVisionService => {
  const { reVisionService } = useServices();
  return reVisionService;
};

/**
 * Hook to check if we're running in mock mode
 */
export const useIsMockMode = (): boolean => {
  const { isMockMode } = useServices();
  return isMockMode;
};

/**
 * Setup development mock scenarios for easier testing
 */
const setupDevelopmentMockScenarios = (mockService: MockOutlookService) => {
  // Randomly choose a scenario
  const scenarios = [
    () => {
      // Normal email
      mockService.setMockEmailBody(MockTestScenarios.SHORT_EMAIL);
    },
    () => {
      // Long email
      mockService.setMockEmailBody(MockTestScenarios.LONG_EMAIL);
    },
    () => {
      // Multilingual email
      mockService.setMockEmailBody(MockTestScenarios.MULTILINGUAL_EMAIL);
    },
  ];

  const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
  randomScenario();

  console.log("Development mock scenarios set up");
};

/**
 * Development tools component for mock mode
 * Only shown in development environment
 */
const MockModeDevTools: React.FC<{ mockService: MockOutlookService }> = ({ mockService }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const styles = useDevToolsStyles();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className={styles.container}>
      <div
        className={isCollapsed ? styles.header : styles.headerExpanded}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        🔧 Mock Mode Dev Tools {isCollapsed ? "▶" : "▼"}
      </div>

      {!isCollapsed && (
        <div className={styles.buttonContainer}>
          <button
            onClick={() => mockService.setMockEmailBody(MockTestScenarios.SHORT_EMAIL)}
            className={styles.button}
          >
            Short Email
          </button>
          <button
            onClick={() => mockService.setMockEmailBody(MockTestScenarios.LONG_EMAIL)}
            className={styles.button}
          >
            Long Email
          </button>
          <button
            onClick={() => mockService.setMockEmailBody(MockTestScenarios.MULTILINGUAL_EMAIL)}
            className={styles.button}
          >
            Multilingual Email
          </button>
          <button onClick={() => mockService.setMockComposeMode(true)} className={styles.button}>
            Compose Mode
          </button>
          <button onClick={() => mockService.setMockComposeMode(false)} className={styles.button}>
            Reply Mode
          </button>
          <button onClick={() => mockService.setMockAppointment(true)} className={styles.button}>
            Appointment Context
          </button>
          <button onClick={() => mockService.setMockAppointment(false)} className={styles.button}>
            Message Context
          </button>
        </div>
      )}
    </div>
  );
};
