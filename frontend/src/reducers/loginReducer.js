import * as c from '../constants/constants'

let loginInitState = {
  loggedIn : false
}



export function loginReducer(state=loginInitState, action) {
  switch(action.type) {
      case c.LOGIN_USER:
        console.log(action)
        return {loggedIn : true};
      default:
        return state;
  }
}
