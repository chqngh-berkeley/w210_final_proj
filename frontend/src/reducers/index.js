import { combineReducers } from 'redux'
import {loginReducer} from './loginReducer'
import {receiptReducer} from './receiptReducer'
import {groceryRecReducer} from './groceryRecReducer'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import {reducer as toastrReducer} from 'react-redux-toastr'

const WebApp = combineReducers({
  loginReducer,
  receiptReducer,
  groceryRecReducer,
  routing: routerReducer,
  toastr : toastrReducer
})

export default WebApp
