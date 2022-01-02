export default {
  home: () => `/`,
  articleEdit: (slug) => `/editor/${slug}`,
  articleNew: () => `/editor`,
  articleView: (slug) => `/article/${slug}`,
  userEdit: () => `/settings`,
  userLogin: () => `/user/login`,
  userNew: () => `/user/register`,
  userView: (uid) => `/profile/${uid}`,
  userViewLikes: (uid) => `/profile/${uid}/favorites`,
}
