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
import TranslatePage, { TranslatePageState } from "./TranslatePage";
import ComposePage, { ComposePageState } from "./ComposePage";
import { EmailMode, getCurrentMode } from "../services/emailServices";
import RevisePage, { RevisePageState } from "./Revise";

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

const defaultGlobalState: GlobalState = {
  translatePageState: {
    input: "",
    output: "",
    summary: "",
  },
  composePageState: {
    currentEmailSubject: "",
    currentEmailBody: "",
    input: "",
    subject: "",
    body: "",
  },
  revisePageState: {
    draft: "",
    reviseSuggestions: {
      suggestionCategories: [],
    },
    revisedText: "",
  },
  setGlobalState: () => {},
};

export const GlobalStateContext = React.createContext(defaultGlobalState);

export interface GlobalState {
  translatePageState: TranslatePageState;
  composePageState: ComposePageState;
  revisePageState: RevisePageState;
  setGlobalState: React.Dispatch<React.SetStateAction<GlobalState>>;
}

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setGlobalState] = React.useState(defaultGlobalState);
  return <GlobalStateContext.Provider value={{ ...state, setGlobalState }}>{children}</GlobalStateContext.Provider>;
};

const TabContainer: React.FC = () => {
  const styles = useStyles();

  const isComposeMode = getCurrentMode() === EmailMode.MessageCompose;

  const [selectedValue, setSelectedValue] = React.useState<TabValue>(isComposeMode ? "tab-compose" : "tab-translate");

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
  TranslateTab.displayName = "TranslateTab";

  const ComposeTab = React.memo(() => {
    return (
      <section>
        <ComposePage />
      </section>
    );
  });
  ComposeTab.displayName = "ComposeTab";

  const ReviseTab = React.memo(() => {
    return (
      <section>
        <RevisePage />
      </section>
    );
  });
  ReviseTab.displayName = "ReviseTab";

  return (
    <GlobalStateProvider>
      {/* <h1>Tabs</h1> */}
      <div className={styles.root}>
        <div className={styles.tabListContainer}>
          <TabList className={styles.tabList} selectedValue={selectedValue} onTabSelect={onTabSelect}>
            <Tab id="Translate" value="tab-translate" icon={<TranslateIcon />}>
              Translate
            </Tab>
            {isComposeMode && (
              <Tab id="Compose" value="tab-compose" icon={<ComposeIcon />}>
                Compose
              </Tab>
            )}
            {isComposeMode && (
              <Tab id="Revise" value="tab-revise" icon={<ReviseIcon />}>
                Revise
              </Tab>
            )}
          </TabList>
        </div>
        <div className={styles.panels}>
          {selectedValue === "tab-translate" && <TranslateTab />}
          {selectedValue === "tab-compose" && <ComposeTab />}
          {selectedValue === "tab-revise" && <ReviseTab />}
        </div>
      </div>
    </GlobalStateProvider>
  );
};

export default TabContainer;
