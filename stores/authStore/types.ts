
export type authState =  {
  inputEmail: string;
}

export type authAction = {
  setInputEmail: (email: string) => void;
}
