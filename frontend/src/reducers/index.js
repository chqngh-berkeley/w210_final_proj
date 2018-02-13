import { combineReducers } from 'redux'
import {menuReducer} from './menuReducer'
import {loginReducer} from './loginReducer'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

const WebApp = combineReducers({
  menuReducer,
  loginReducer,
  routing: routerReducer
})

export default WebApp
