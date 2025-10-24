import * as React from "react";
import { makeStyles, TabList, Tab, SelectTabEvent, SelectTabData } from "@fluentui/react-components";
import { useTranslation } from "react-i18next";
import Translate from "./Translate";
import Compose from "./Compose";
import { Revise } from "./Revise";
import Reply from "./Reply";
import { useOutlookService } from "../../services/ServiceProvider";
import type { OutlookMode } from "../../services/OutlookService";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    flex: 1,
    minHeight: 0,
  },
  banner: {
    backgroundColor: "#F3F2F1",
    border: "1px solid #E1DFDD",
    borderRadius: "4px",
    padding: "8px 12px",
    color: "#605E5C",
    margin: "8px 0 12px 0",
    fontSize: "12px",
  },
  tabList: {
    borderBottom: "1px solid #e1e1e1",
    marginBottom: "16px",
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
  },
  tabContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  tabPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  hidden: {
    display: "none",
  },
  infoNote: {
    padding: "16px",
    color: "#666",
    fontStyle: "italic",
  },
});

type TabKey = "translate" | "reply" | "compose" | "revise";

const TabArea: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation('tabs');
  const outlookService = useOutlookService();
  const [selectedTab, setSelectedTab] = React.useState<TabKey>("translate");
  const [mode, setMode] = React.useState<OutlookMode>("mailRead");
  const isReadLike = mode === "mailRead" || mode === "meetingDetailsAttendee";

  React.useEffect(() => {
    let mounted = true;
    // Fetch current mode on mount
    outlookService.getMode().then((res) => {
      if (!mounted) return;
      if (res.success && res.data) {
        setMode(res.data);
        // If in read mode and a compose-only tab is selected, force translate
        if (isReadLike && (selectedTab === "compose" || selectedTab === "revise")) {
          setSelectedTab("translate");
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleTabSelect = (_: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value as TabKey);
  };

  const renderTabContent = () => {
    return (
      <>
        {/* Always render all components but hide inactive ones */}
        <div className={`${styles.tabPanel} ${selectedTab !== "translate" ? styles.hidden : ""}`}>
          <Translate />
        </div>
        
        <div className={`${styles.tabPanel} ${selectedTab !== "reply" ? styles.hidden : ""}`}>
          <Reply />
        </div>
        
        <div className={`${styles.tabPanel} ${selectedTab !== "compose" ? styles.hidden : ""}`}>
          {isReadLike ? (
            <div className={styles.infoNote}>{t('common:messages.composeOnly')}</div>
          ) : (
            <Compose />
          )}
        </div>
        
        <div className={`${styles.tabPanel} ${selectedTab !== "revise" ? styles.hidden : ""}`}>
          {isReadLike ? (
            <div className={styles.infoNote}>{t('common:messages.composeOnly')}</div>
          ) : (
            <Revise />
          )}
        </div>
      </>
    );
  };

  return (
    <div className={styles.root}>
      <TabList 
        className={styles.tabList}
        selectedValue={selectedTab} 
        onTabSelect={handleTabSelect}
      >
        <Tab value="translate">{t('translate')}</Tab>
        <Tab value="reply">{t('reply')}</Tab>
        <Tab value="compose" disabled={isReadLike}>
          {t('compose')}
        </Tab>
        <Tab value="revise" disabled={isReadLike}>
          {t('revise')}
        </Tab>
      </TabList>
      
      <div className={styles.tabContent}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TabArea;
