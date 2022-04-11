import Router from 'next/router'
import React from 'react'

import { setupUserLocalStorage } from 'front'
import ListErrors from 'front/ListErrors'
import UserAPI from 'front/api/user'
import { useCtrlEnterSubmit } from 'front/ts'

const LoginForm = ({ register = false }) => {
  const [isLoading, setLoading] = React.useState(false)
  const [errors, setErrors] = React.useState([])
  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const handleUsernameChange = React.useCallback(
    (e) => setUsername(e.target.value),
    [setUsername]
  )
  const handleEmailChange = React.useCallback(
    (e) => setEmail(e.target.value),
    []
  )
  const handlePasswordChange = React.useCallback(
    (e) => setPassword(e.target.value),
    []
  )
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let data, status
      if (register) {
        ;({ data, status } = await UserAPI.register(username, email, password))
      } else {
        ;({ data, status } = await UserAPI.login(email, password))
      }
      if (status !== 200 && data?.errors) {
        setErrors(data.errors)
      }
      if (data?.user) {
        await setupUserLocalStorage(data, setErrors)
        Router.push('/')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }
  useCtrlEnterSubmit(handleSubmit)
  return (
    <>
      <ListErrors errors={errors} />
      <form onSubmit={handleSubmit}>
        <fieldset>
          {register && (
            <fieldset className="form-group">
              <input
                className="form-control form-control-lg"
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
              />
            </fieldset>
          )}
          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
            />
          </fieldset>
          <fieldset className="form-group">
            <input
              className="form-control form-control-lg"
              type="password"
              placeholder="Password"
              value={password}
              onChange={handlePasswordChange}
            />
          </fieldset>
          <button
            className="btn btn-lg btn-primary pull-xs-right"
            type="submit"
            disabled={isLoading}
          >
            {`${register ? 'Sign up' : 'Sign in'}`}
          </button>
        </fieldset>
      </form>
    </>
  )
}

export default LoginForm
