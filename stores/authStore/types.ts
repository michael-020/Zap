
export type authState =  {
  inputEmail: string;
  authUser: User | null
}

export type authAction = {
  setInputEmail: (email: string) => void;
  setAuthUser: (data: User) => void;
}

export type User = {
  id: string;
  email: string
}