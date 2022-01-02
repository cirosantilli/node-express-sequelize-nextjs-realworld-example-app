import axios from 'axios'

import { apiPath } from 'front/config'

const UserAPI = {
  current: async () => {
    const user: any = window.localStorage.getItem('user')
    const token = user?.token
    try {
      const response = await axios.get(`/user`, {
        headers: {
          Authorization: `Token ${encodeURIComponent(token)}`,
        },
      })
      return response
    } catch (error) {
      return error.response
    }
  },
  login: async (email, password) => {
    try {
      const response = await axios.post(
        `${apiPath}/users/login`,
        JSON.stringify({ user: { email, password } }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      return response
    } catch (error) {
      return error.response
    }
  },
  register: async (username, email, password) => {
    try {
      const response = await axios.post(
        `${apiPath}/users`,
        JSON.stringify({ user: { username, email, password } }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      return response
    } catch (error) {
      return error.response
    }
  },
  save: async (user) => {
    try {
      const response = await axios.put(
        `${apiPath}/user`,
        JSON.stringify({ user }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      return response
    } catch (error) {
      return error.response
    }
  },
  follow: async (username) => {
    const user: any = JSON.parse(window.localStorage.getItem('user'))
    const token = user?.token
    try {
      const response = await axios.post(
        `${apiPath}/profiles/${username}/follow`,
        {},
        {
          headers: {
            Authorization: `Token ${encodeURIComponent(token)}`,
          },
        }
      )
      return response
    } catch (error) {
      return error.response
    }
  },
  unfollow: async (username) => {
    const user: any = JSON.parse(window.localStorage.getItem('user'))
    const token = user?.token
    try {
      const response = await axios.delete(
        `${apiPath}/profiles/${username}/follow`,
        {
          headers: {
            Authorization: `Token ${encodeURIComponent(token)}`,
          },
        }
      )
      return response
    } catch (error) {
      return error.response
    }
  },
  get: async (username) => {
    return axios.get(`${apiPath}/profiles/${username}`)
  },
}

export default UserAPI
