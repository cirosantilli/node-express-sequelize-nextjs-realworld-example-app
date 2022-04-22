import axios from 'axios'
import Router from 'next/router'
import React from 'react'

import { setupUserLocalStorage } from 'front'
import { apiPath } from 'front/config'
import ListErrors from 'front/ListErrors'
import useLoggedInUser from 'front/useLoggedInUser'
import { useCtrlEnterSubmit } from 'front/ts'

const SettingsForm = () => {
  const [isLoading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState([])
  const [userInfo, setUserInfo] = React.useState({
    image: '',
    username: '',
    bio: '',
    email: '',
    password: '',
  })
  const loggedInUser = useLoggedInUser()
  React.useEffect(() => {
    if (!loggedInUser) return
    setUserInfo((prev) => Object.assign(prev, loggedInUser))
  }, [loggedInUser])
  const updateState = (field) => (e) => {
    setUserInfo({ ...userInfo, [field]: e.target.value })
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const user = { ...userInfo }
    if (!user.password) {
      delete user.password
    }
    const { data, status } = await axios.put(
      `${apiPath}/user`,
      JSON.stringify({ user }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${loggedInUser?.token}`,
        },
      }
    )
    setLoading(false)
    if (status !== 200) {
      setErrors(data.errors.body)
    }
    if (data?.user) {
      await setupUserLocalStorage(data, setErrors)
      Router.push(`/profile/${user.username}`)
    }
  }
  useCtrlEnterSubmit(handleSubmit)
  return (
    <React.Fragment>
      <ListErrors errors={errors} />
      <form onSubmit={handleSubmit}>
        <fieldset>
          <fieldset className="form-group">
            <input
              className="form-control"
              type="text"
              placeholder="URL of profile picture"
              value={userInfo.image ? userInfo.image : ''}
              onChange={updateState('image')}
            />
          </fieldset>
          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="text"
              placeholder="Username"
              value={userInfo.username}
              onChange={updateState('username')}
            />
          </fieldset>
          <fieldset className="form-group">
            <textarea
              className="form-control form-control-lg"
              rows={8}
              placeholder="Short bio about you"
              value={userInfo.bio}
              onChange={updateState('bio')}
            />
          </fieldset>
          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="email"
              placeholder="Email"
              value={userInfo.email}
              onChange={updateState('email')}
            />
          </fieldset>
          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="password"
              placeholder="New Password"
              value={userInfo.password}
              onChange={updateState('password')}
              autoComplete="new-password"
            />
          </fieldset>
          <button
            className="btn btn-lg btn-primary pull-xs-right"
            type="submit"
            disabled={isLoading}
          >
            Update Settings
          </button>
        </fieldset>
      </form>
    </React.Fragment>
  )
}

export default SettingsForm
