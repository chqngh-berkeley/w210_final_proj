import { combineReducers } from 'redux'
import {menuReducer} from './menuReducer'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

const WebApp = combineReducers({
  menuReducer,
  routing: routerReducer
})

export default WebApp
