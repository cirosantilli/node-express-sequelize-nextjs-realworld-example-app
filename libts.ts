import React from "react";

export const AppContext = React.createContext({ title: '', setTitle: undefined });

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
