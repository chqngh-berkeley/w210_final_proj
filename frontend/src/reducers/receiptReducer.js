import * as c from '../constants/constants'

let receiptInitData = {
  receiptId : null,
  receiptData : []
}

export function receiptReducer(state=receiptInitData, action) {
  switch(action.type) {
      case c.SET_RECEIPT_ID:
        return Object.assign({}, state,
        {receiptId: action.receiptId});
      case c.NEW_RECEIPT_DATA:
        return Object.assign({}, state,
        {receiptData : action.receiptData});
      default:
        return state;
  }
}
