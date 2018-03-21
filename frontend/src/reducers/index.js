import { combineReducers } from 'redux'
import {menuReducer} from './menuReducer'
import {loginReducer} from './loginReducer'
import {receiptReducer} from './receiptReducer'
import {groceryRecReducer} from './groceryRecReducer'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

const WebApp = combineReducers({
  menuReducer,
  loginReducer,
  receiptReducer,
  groceryRecReducer,
  routing: routerReducer
})

export default WebApp
