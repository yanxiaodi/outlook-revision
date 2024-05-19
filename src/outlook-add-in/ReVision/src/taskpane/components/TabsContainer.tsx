import * as React from "react";
import { Tab, TabList, shorthands, makeStyles, tokens } from "@fluentui/react-components";
import {
  TranslateAuto20Regular,
  TranslateAuto20Filled,
  Compose20Regular,
  Compose20Filled,
  CalligraphyPenCheckmark20Regular,
  CalligraphyPenCheckmark20Filled,
  bundleIcon,
} from "@fluentui/react-icons";
import type { SelectTabData, SelectTabEvent, TabValue } from "@fluentui/react-components";
import TranslatePage from "./TranslatePage";

const TranslateIcon = bundleIcon(TranslateAuto20Regular, TranslateAuto20Filled);
const ComposeIcon = bundleIcon(Compose20Regular, Compose20Filled);
const ReviseIcon = bundleIcon(CalligraphyPenCheckmark20Regular, CalligraphyPenCheckmark20Filled);

const useStyles = makeStyles({
  tabContainer__header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingBottom: "30px",
    paddingTop: "10px",
    backgroundColor: tokens.colorNeutralBackground3,
  },
  root: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    ...shorthands.padding("0px", "10px"),
    rowGap: "20px",
  },
  tabListContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  tabList: {
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
  },
  panels: {
    //...shorthands.padding(0, "10px"),
    "& th": {
      textAlign: "left",
      //...shorthands.padding(0, "10px", 0, 0),
    },
    width: "100%",
  },
  propsTable: {
    "& td:first-child": {
      fontWeight: tokens.fontWeightSemibold,
    },
    "& td": {
      ...shorthands.padding(0, "10px", 0, 0),
    },
  },
});

const TabContainer: React.FC = () => {
  const styles = useStyles();

  const [selectedValue, setSelectedValue] = React.useState<TabValue>("conditions");

  const onTabSelect = (_event: SelectTabEvent, data: SelectTabData) => {
    setSelectedValue(data.value);
  };

  const TranslateTab = React.memo(() => {
    return (
      <section>
        <TranslatePage />
      </section>
    );
  });

  const ComposeTab = React.memo(() => {
    return (
      <section>
        <h2>Compose</h2>
        <p>Compose the email content in the user's language.</p>
      </section>
    );
  });

  const ReviseTab = React.memo(() => {
    return (
      <section>
        <h2>Revise</h2>
        <p>Revise the email content for writing tone.</p>
      </section>
    );
  });

  return (
    <section>
      {/* <h1>Tabs</h1> */}
      <div className={styles.root}>
        <div className={styles.tabListContainer}>
          <TabList className={styles.tabList} selectedValue={selectedValue} onTabSelect={onTabSelect}>
            <Tab id="Translate" value="tab-translate" icon={<TranslateIcon />}>
              Translate
            </Tab>
            <Tab id="Compose" value="tab-compose" icon={<ComposeIcon />}>
              Compose
            </Tab>
            <Tab id="Revise" value="tab-revise" icon={<ReviseIcon />}>
              Revise
            </Tab>
          </TabList>
        </div>
        <div className={styles.panels}>
          {selectedValue === "tab-translate" && <TranslateTab />}
          {selectedValue === "tab-compose" && <ComposeTab />}
          {selectedValue === "tab-revise" && <ReviseTab />}
        </div>
      </div>
    </section>
  );
};

export default TabContainer;
