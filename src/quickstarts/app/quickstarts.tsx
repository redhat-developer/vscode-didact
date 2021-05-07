import * as React from "react";
import "@patternfly/patternfly/base/patternfly-shield-inheritable.css";
import "@patternfly/patternfly/patternfly.min.css";
import "@patternfly/patternfly/utilities/Accessibility/accessibility.css";
import "@patternfly/react-catalog-view-extension/dist/css/react-catalog-view-extension.css";
import "@cloudmosaic/quickstarts/dist/quickstarts.css";
import {
  QuickStartDrawer,
  QuickStartCatalogPage,
  useValuesForQuickStartContext,
  QuickStartContext,
  useLocalStorage,
} from "@cloudmosaic/quickstarts";
import { Base64 } from "js-base64";

export const QuickStartsPreview = ({
  initialData: config,
  filePath,
  vscode,
}: {
  initialData: string;
  filePath: string;
  vscode: any;
}) => {
  const decodedConfig = Base64.decode(config);
  // console.log(decodedConfig);
  const allQuickStarts = [];
  allQuickStarts.push(JSON.parse(decodedConfig));
  const [activeQuickStartID, setActiveQuickStartID] = useLocalStorage(
    "quickstartId",
    ""
  );
  const [allQuickStartStates, setAllQuickStartStates] = useLocalStorage(
    "quickstarts",
    {}
  );
  const valuesForQuickstartContext = useValuesForQuickStartContext({
    allQuickStarts,
    activeQuickStartID,
    setActiveQuickStartID,
    allQuickStartStates,
    setAllQuickStartStates,
  });
  return (
    <QuickStartContext.Provider value={valuesForQuickstartContext}>
      <QuickStartDrawer>
        <QuickStartCatalogPage />
      </QuickStartDrawer>
    </QuickStartContext.Provider>
  );
};
