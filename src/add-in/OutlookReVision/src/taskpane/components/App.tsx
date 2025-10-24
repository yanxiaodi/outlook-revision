import * as React from "react";
import { makeStyles, Toaster } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import Header from "./Header";
import Settings from "./Settings";
import Feedback from "./Feedback";
import CurrentSettings from "./CurrentSettings";
import TabArea from "./TabArea";
import { useSettings } from "../../hooks/useSettings";
import { useLanguageSync } from "../../hooks/useLanguageSync";
import { ServiceProvider } from "../../services";
import { useToast } from "../../hooks/useToast";

interface AppProps {
  title: string;
}

const useStyles = makeStyles({
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  loading: {
    padding: "20px",
    textAlign: "center",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "0 16px 16px 16px",
    minHeight: 0,
  },
});

const App: React.FC<AppProps> = (props: AppProps) => {
  const styles = useStyles();
  const { t, ready } = useTranslation();
  const [currentPage, setCurrentPage] = React.useState<"main" | "settings" | "feedback">("main");
  const { hasSettings, isLoading } = useSettings();
  
  // Use the global toaster ID defined in useToast hook
  const globalToasterId = "app-toaster";

  // Sync UI language setting with i18n
  useLanguageSync();

  // Auto-navigate to settings if no settings exist
  React.useEffect(() => {
    if (!isLoading && !hasSettings) {
      setCurrentPage("settings");
    }
  }, [hasSettings, isLoading]);

  const handleSettingsClick = () => {
    setCurrentPage("settings");
  };

  const handleFeedbackClick = () => {
    setCurrentPage("feedback");
  };

  const handleBackToMain = () => {
    setCurrentPage("main");
  };

  // Show loading state while i18n or settings are loading
  if (!ready || isLoading) {
    return (
      <div className={styles.root}>
        <div className={styles.loading}>{ready ? t("common:loading") : "Loading..."}</div>
      </div>
    );
  }

  if (currentPage === "settings") {
    return (
      <ServiceProvider>
        <div className={styles.root}>
          <Toaster toasterId={globalToasterId} position="top-end" />
          <Header
            logo="assets/logo-filled.png"
            title={props.title}
            message={t("settings:title")}
            onSettingsClick={handleSettingsClick}
            onFeedbackClick={handleFeedbackClick}
          />
          <div className={styles.content}>
            <Settings onBackClick={handleBackToMain} autoSaveDefaults={!hasSettings} />
          </div>
        </div>
      </ServiceProvider>
    );
  }

  if (currentPage === "feedback") {
    return (
      <ServiceProvider>
        <div className={styles.root}>
          <Toaster toasterId={globalToasterId} position="top-end" />
          <Header
            logo="assets/logo-filled.png"
            title={props.title}
            message={t("common:feedback.header")}
            onSettingsClick={handleSettingsClick}
            onFeedbackClick={handleFeedbackClick}
          />
          <div className={styles.content}>
            <Feedback onBackClick={handleBackToMain} />
          </div>
        </div>
      </ServiceProvider>
    );
  }

  return (
    <ServiceProvider>
      <div className={styles.root}>
        <Toaster toasterId={globalToasterId} position="top-end" />
        <Header
          logo="assets/logo-filled.png"
          title={props.title}
          message={t("common:welcome")}
          onSettingsClick={handleSettingsClick}
          onFeedbackClick={handleFeedbackClick}
        />
        <div className={styles.content}>
          <CurrentSettings />
          <TabArea />
        </div>
      </div>
    </ServiceProvider>
  );
};

export default App;
