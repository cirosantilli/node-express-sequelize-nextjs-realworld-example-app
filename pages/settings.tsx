import Router from 'next/router'
import React from 'react'
import { mutate, trigger } from 'swr'

import { AUTH_LOCAL_STORAGE_NAME } from 'front'
import SettingsForm from 'front/SettingsForm'
import checkLogin from 'front/checkLogin'
import storage from 'front/localStorageHelper'
import { AppContext } from 'front/ts'
import { deleteCookie } from 'front'

const Settings = () => {
  React.useEffect(() => {
    const loggedInUser = storage(AUTH_LOCAL_STORAGE_NAME)
    const isLoggedIn = checkLogin(loggedInUser)
    if (!isLoggedIn) {
      Router.push(`/`)
    }
  })
  const handleLogout = async (e) => {
    e.preventDefault()
    window.localStorage.removeItem('user')
    deleteCookie('auth')
    mutate('user', null)
    Router.push(`/`).then(() => trigger('user'))
  }
  const title = 'Your Settings'
  const { setTitle } = React.useContext(AppContext)
  React.useEffect(() => {
    setTitle(title)
  }, [setTitle, title])
  return (
    <>
      <div className="settings-page">
        <div className="container page">
          <div className="row">
            <div className="col-md-6 offset-md-3 col-xs-12">
              <h1 className="text-xs-center">{title}</h1>
              <SettingsForm />
              <hr />
              <button className="btn btn-outline-danger" onClick={handleLogout}>
                Or click here to logout.
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Settings
