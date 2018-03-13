import * as c from '../constants/constants'

let loginInitState = {
  loggedIn : false,
  username : null,
  password : null,
  email : null,
  firstname : null,
  lastname : null,
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
        console.log(action)
        return {
          loggedIn : true,
          username : action.username,
          password : action.password,
          email : action.email,
          firstname : action.firstname,
          lastname : action.lastname,
          age : action.age,
          income : action.income,
          family_size : action.family_size,
          num_adults : action.num_adults,
          num_kids : action.num_kids,
          shopping_freq : action.shopping_freq
        };
      default:
        return state;
  }
}
