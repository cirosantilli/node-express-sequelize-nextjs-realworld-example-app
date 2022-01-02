import axios from 'axios'
import { useRouter } from 'next/router'
import { trigger } from 'swr'

import { apiPath } from 'front/config'
import useLoggedInUser from 'front/useLoggedInUser'

const DeleteButton = ({ commentId }) => {
  const loggedInUser = useLoggedInUser()
  const router = useRouter()
  const {
    query: { pid },
  } = router
  const handleDelete = async (commentId) => {
    await axios.delete(`${apiPath}/articles/${pid}/comments/${commentId}`, {
      headers: {
        Authorization: `Token ${loggedInUser?.token}`,
      },
    })
    trigger(`${apiPath}/articles/${pid}/comments`)
  }

  return (
    <span className="mod-options">
      <i className="ion-trash-a" onClick={() => handleDelete(commentId)} />
    </span>
  )
}

export default DeleteButton
