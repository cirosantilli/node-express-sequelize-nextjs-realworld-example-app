import axios from 'axios'

import { apiPath } from 'front/config'

const getQuery = (limit: number, page: number): string =>
  `limit=${limit}&offset=${page ? page * limit : 0}`

const ArticleAPI = {
  all: (page, limit = 10) =>
    axios.get(`${apiPath}/articles?${getQuery(limit, page)}`),

  byAuthor: (author, page = 0, limit = 5) =>
    axios.get(
      `${apiPath}/articles?author=${encodeURIComponent(author)}&${getQuery(
        limit,
        page
      )}`
    ),

  byTag: (tag, page = 0, limit = 10) =>
    axios.get(
      `${apiPath}/articles?tag=${encodeURIComponent(tag)}&${getQuery(
        limit,
        page
      )}`
    ),

  delete: (id, token) =>
    axios.delete(`${apiPath}/articles/${id}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
    }),

  favorite: (slug) => axios.post(`${apiPath}/articles/${slug}/favorite`),

  favoritedBy: (author, page) =>
    axios.get(
      `${apiPath}/articles?favorited=${encodeURIComponent(author)}&${getQuery(
        10,
        page
      )}`
    ),

  feed: (page, limit = 10) =>
    axios.get(`${apiPath}/articles/feed?${getQuery(limit, page)}`),

  get: (slug) => axios.get(`${apiPath}/articles/${encodeURIComponent(slug)}`),

  unfavorite: (slug) => axios.delete(`${apiPath}/articles/${slug}/favorite`),

  update: async (article, pid, token) => {
    const { data, status } = await axios.put(
      `${apiPath}/articles/${pid}`,
      JSON.stringify({ article }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${encodeURIComponent(token)}`,
        },
      }
    )
    return {
      data,
      status,
    }
  },

  create: async (article, token) => {
    const { data, status } = await axios.post(
      `${apiPath}/articles`,
      JSON.stringify({ article }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${encodeURIComponent(token)}`,
        },
      }
    )
    return {
      data,
      status,
    }
  },
}

export default ArticleAPI
