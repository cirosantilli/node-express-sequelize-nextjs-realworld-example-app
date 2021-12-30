const localStorage = async (key) => {
  const value = localStorage.getItem(key)
  return value ? JSON.parse(value) : null
}

export default localStorage
