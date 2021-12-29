import { getStaticPathsProfile, getStaticPropsProfile } from "lib/profile"
import ProfileHoc from "front/Profile"
export const getStaticPaths = getStaticPathsProfile
const type = 'my-posts'
export const getStaticProps = getStaticPropsProfile(type)
const Profile = ProfileHoc(type)
export default Profile
