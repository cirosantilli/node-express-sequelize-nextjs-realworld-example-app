import React from 'react'

import useLoggedInUser from 'front/useLoggedInUser'

export const AppContext = React.createContext<{
  page: number
  setPage: React.Dispatch<any> | undefined
  tab: string
  setTab: React.Dispatch<any> | undefined
  tag: string
  setTag: React.Dispatch<any> | undefined
  title: string
  setTitle: React.Dispatch<any> | undefined
}>({
  page: 0,
  setPage: undefined,
  tab: '',
  setTab: undefined,
  tag: '',
  setTag: undefined,
  title: '',
  setTitle: undefined,
})

function getTabForLoggedInUser(loggedInUser) {
  if (loggedInUser === undefined) {
    return undefined
  } else {
    return loggedInUser === null ? 'global' : 'feed'
  }
}

export const resetIndexState = (setPage, setTab, loggedInUser) => {
  setPage(0)
  setTab(getTabForLoggedInUser(loggedInUser))
}

// Global state.
export const AppContextProvider = ({ children }) => {
  const loggedInUser = useLoggedInUser()
  const [title, setTitle] = React.useState()
  // This state has to be lifted to app tolevel because there
  // are many things that need to set it from outside of article lists,
  // without recreationg the article list, notably Tags list
  // (when you click a tag, the list updates to filter by it,
  // and you want to go to page 0) and Navigation links (if you
  // are in global while logged in, it will move you to feed,
  // and should reset the page to 0).
  const [page, setPage] = React.useState(0)
  const [tab, setTab] = React.useState(getTabForLoggedInUser(loggedInUser))
  const [tag, setTag] = React.useState('')
  return (
    <AppContext.Provider
      value={{
        page,
        setPage,
        tab,
        setTab,
        tag,
        setTag,
        title,
        setTitle,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useCtrlEnterSubmit(handleSubmit) {
  React.useEffect(() => {
    function ctrlEnterListener(e) {
      if (e.code === 'Enter' && e.ctrlKey) {
        handleSubmit(e)
      }
    }
    document.addEventListener('keydown', ctrlEnterListener)
    return () => {
      document.removeEventListener('keydown', ctrlEnterListener)
    }
  })
}
