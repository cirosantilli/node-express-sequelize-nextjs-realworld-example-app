import { getStaticPathsProfile, getStaticPropsProfile } from 'back/ProfilePage'
import ProfileHoc from 'front/ProfilePage'
export const getStaticPaths = getStaticPathsProfile
const type = 'favorites'
export const getStaticProps = getStaticPropsProfile(type)
const Profile = ProfileHoc(type)
export default Profile
