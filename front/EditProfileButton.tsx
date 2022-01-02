import React from 'react'

import CustomLink from 'front/CustomLink'
import Maybe from 'front/Maybe'
import routes from 'front/routes'

interface EditProfileButtonProps {
  isCurrentUser: boolean
}

const EditProfileButton = ({ isCurrentUser }: EditProfileButtonProps) => (
  <Maybe test={isCurrentUser}>
    <CustomLink
      href={routes.userEdit()}
      className="btn btn-sm btn-outline-secondary action-btn"
    >
      <i className="ion-gear-a" /> Edit Profile Settings
    </CustomLink>
  </Maybe>
)

export default EditProfileButton
