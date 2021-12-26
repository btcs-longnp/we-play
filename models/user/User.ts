interface User {
  id: string;
  name: string;
}

export const newUser = (id: string, name: string): User => {
  return {
    id,
    name,
  };
};

export default User;
