import * as c from '../constants/constants'

let receiptInitData = {
  receipts:[],
  current_receipt: {
    receipt : [],
    wastage: []
  }
}

export function receiptReducer(state=receiptInitData, action) {
  switch(action.type) {
      case c.SET_RECEIPT:
        return Object.assign({}, state,
        {current_receipt : action.receipt});
      case c.SET_RECEIPT_HISTORY:
        return Object.assign({}, state, {receipts : action.receipts});
      case c.SET_RECEIPT_ITEM:
        let mod_item = action.item;
        let receipt = []
        for(var i =0; i< state.current_receipt.length; i++) {
          var item = state.current_receipt[i];
          if(item['id'] == mod_item['id']) {
            receipt.push(mod_item);
          } else {
            receipt.push(item)
          }
        }
        return Object.assign({}, state, {current_receipt : receipt});;
      default:
        return state;
  }
}
