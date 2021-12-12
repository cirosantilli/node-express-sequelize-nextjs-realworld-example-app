import React from "react";

import getLoggedInUser from "lib/utils/getLoggedInUser";

export const AppContext = React.createContext<{
  page: number
  setPage: React.Dispatch<any> | undefined
  tab: string
  setTab: React.Dispatch<any> | undefined
  title: string
  setTitle: React.Dispatch<any> | undefined
}>({
  page: 0,
  setPage: undefined,
  tab: '',
  setTab: undefined,
  title: '',
  setTitle: undefined,
});

export const resetIndexState = (setPage, setTab, loggedInUser) => {
  setPage(0)
  setTab(loggedInUser ? 'feed' : 'global')
}

// Global state.
export const AppContextProvider = ({ children }) => {
  const loggedInUser = getLoggedInUser()
  const [title, setTitle] = React.useState()
  // This state has to be lifted to app tolevel because there
  // are many things that need to set it from outside of article lists,
  // without recreationg the article list, notably Tags list
  // (when you click a tag, the list updates to filter by it,
  // and you want to go to page 0) and Navigation links (if you
  // are in global while logged in, it will move you to feed,
  // and should reset the page to 0).
  const [page, setPage] = React.useState(0)
  const [tab, setTab] = React.useState(loggedInUser ? 'feed' : 'global')
  return (<AppContext.Provider value={{
    page, setPage,
    tab, setTab,
    title, setTitle,
  }}>
    {children}
  </AppContext.Provider>)
};

export function useCtrlEnterSubmit(handleSubmit) {
  React.useEffect(() => {
    function ctrlEnterListener(e) {
      if (e.code === 'Enter' && e.ctrlKey) {
        handleSubmit(e)
      }
    }
    document.addEventListener('keydown', ctrlEnterListener);
    return () => {
      document.removeEventListener('keydown', ctrlEnterListener);
    };
  });
}
