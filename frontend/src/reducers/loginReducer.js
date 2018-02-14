import * as c from '../constants/constants'

let loginInitState = {
  loggedIn : false,
  username : null
}



export function loginReducer(state=loginInitState, action) {
  switch(action.type) {
      case c.LOGIN_USER:
        console.log(action)
        return {loggedIn : true, username: action.username};
      default:
        return state;
  }
}
