import * as c from '../constants/constants'


export const loginUser = (username, password) => {
  return {
    type: c.LOGIN_USER,
    username,
    password
  }
}
export const logoutUser = () => {
  return {
    type: c.LOGOUT_USER
  }
}

export const signUpUser = (username) => {
  return {
    type: c.SIGN_UP,
    username
  }
}
