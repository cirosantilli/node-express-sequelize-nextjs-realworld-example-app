import React from "react";

import useSessionStorage from "lib/hooks/useSessionStorage";

export const AppContext = React.createContext<{
  setPage: React.Dispatch<any> | undefined
  setPageCount: React.Dispatch<any> | undefined
}>({
  title: '',
  setTitle: undefined,
  page: 0,
  setPage: undefined,
  pageCount: 0,
  setPageCount: undefined,
});

export const AppContextProvider = ({ children }) => {
  const [title, setTitle] = React.useState();
  const [page, setPage] = useSessionStorage("offset", 0);
  const [pageCount, setPageCount] = React.useState(1);
  return (<AppContext.Provider value={{
    title, setTitle,
    page, setPage,
    pageCount, setPageCount,
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
