import axios from 'axios'

import { apiPath } from 'front/config'

const CommentAPI = {
  create: async (slug, comment) => {
    try {
      const response = await axios.post(
        `${apiPath}/articles/${slug}/comments`,
        JSON.stringify({ comment })
      )
      return response
    } catch (error) {
      return error.response
    }
  },
  delete: async (slug, commentId) => {
    try {
      const response = await axios.delete(
        `${apiPath}/articles/${slug}/comments/${commentId}`
      )
      return response
    } catch (error) {
      return error.response
    }
  },

  forArticle: (slug) => axios.get(`${apiPath}/articles/${slug}/comments`),
}

export default CommentAPI
