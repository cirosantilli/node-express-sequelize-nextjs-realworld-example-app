const localStorageHelper = (key) => {
  const value = window.localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}
export default localStorageHelper
