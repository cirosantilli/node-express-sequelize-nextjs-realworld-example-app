import React from "react";

import useSessionStorage from "lib/hooks/useSessionStorage";

export const AppContext = React.createContext<{
  setPage: React.Dispatch<any> | undefined
}>({
  title: '',
  setTitle: undefined,
  page: 0,
  setPage: undefined,
});

export const AppContextProvider = ({ children }) => {
  const [title, setTitle] = React.useState();
  const [page, setPage] = useSessionStorage("offset", 0);
  return (<AppContext.Provider value={{
    title, setTitle,
    page, setPage,
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
