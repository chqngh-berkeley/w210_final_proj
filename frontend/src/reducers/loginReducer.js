import * as c from '../constants/constants'

let loginInitState = {
  loggedIn : false,
  username : null, //'184',//'718',
  password : null,
  name : null,
  age : null,
  income : null,
  family_size : null,
  num_adults : null,
  num_kids : null,
  shopping_freq : null
}



export function loginReducer(state=loginInitState, action) {
  switch(action.type) {
      case c.LOGIN_USER:
        let userinfo = action.userinfo
        return {
          username : userinfo.username,
          password : userinfo.password,
          name : userinfo.name,
          age : userinfo.age,
          income : userinfo.income,
          family_size : userinfo.family_size,
          num_adults : userinfo.num_adults,
          num_kids : userinfo.num_kids,
          shopping_freq : userinfo.shop_trip_freq
        };
      case c.UPDATE_USER:
        return Object.assign({}, state, action.user)
      case c.LOGOUT_USER:
        return Object.assign({}, state, loginInitState)
      default:
        return state;
  }
}
