import * as React from "react";
import { makeStyles } from "@fluentui/react-components";

import Settings, { Language, SettingsState } from "./Settings";
import TabsContainer from "./TabsContainer";

interface AppProps {
  title: string;
}

// Create a language list
export const languageList: Language[] = [
  {
    languageCode: "en",
    displayName: "English",
  },
  {
    languageCode: "es",
    displayName: "Spanish",
  },
  {
    languageCode: "fr",
    displayName: "French",
  },
  {
    languageCode: "de",
    displayName: "German",
  },
  {
    languageCode: "it",
    displayName: "Italian",
  },
  {
    languageCode: "ja",
    displayName: "Japanese",
  },
  {
    languageCode: "ko",
    displayName: "Korean",
  },
  {
    languageCode: "pt",
    displayName: "Portuguese",
  },
  {
    languageCode: "ru",
    displayName: "Russian",
  },
  {
    languageCode: "zh",
    displayName: "Chinese",
  },
];

const useStyles = makeStyles({
  root: {
    minHeight: "100vh",
  },
});

export const SettingsContext = React.createContext<{
  settings: SettingsState;
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>;
}>({
  settings: {
    emailLanguage: "en",
    userLanguage: "zh",
    writingTone: "Casual",
  },
  setSettings: () => {},
});

const App: React.FC<AppProps> = (_props: AppProps) => {
  const styles = useStyles();

  // Create a tone list
  const toneList: string[] = ["Colloquial", "Casual", "Professional", "Formal", "Academic"];
  const [settings, setSettings] = React.useState<SettingsState>(() => {
    const savedSettings = localStorage.getItem("settings");
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
          emailLanguage: "en",
          userLanguage: "zh",
          writingTone: "Casual",
        };
  });

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      <div className={styles.root}>
        {/* <Header logo="assets/logo-filled.png" title={props.title} message="Welcome" /> */}
        {/* <HeroList message="Discover what this add-in can do for you today!" items={listItems} /> */}
        <Settings languages={languageList} tones={toneList} />
        {/* <TextInsertion insertText={insertText} /> */}
        <TabsContainer />
      </div>
    </SettingsContext.Provider>
  );
};

export default App;
