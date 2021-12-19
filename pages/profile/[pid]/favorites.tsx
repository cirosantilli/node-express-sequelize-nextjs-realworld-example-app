import { getStaticPathsProfile, getStaticPropsProfile } from "lib/profile"
import ProfileHoc from "components/Profile"
export const getStaticPaths = getStaticPathsProfile
const type = 'favorites'
export const getStaticProps = getStaticPropsProfile('favorites')
const Profile = ProfileHoc('favorites')
export default Profile
