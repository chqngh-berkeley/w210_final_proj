import * as c from '../constants/constants'


export const loginUser = (userinfo) => {
  return {
    type: c.LOGIN_USER,
    userinfo
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

export const updateUser = (user) => {
  return {
    type: c.UPDATE_USER,
    user
  }
}
