const storage = async key => {
  const value = localStorage.getItem(key);
  return !!value ? JSON.parse(value) : null;
};

export default storage;
