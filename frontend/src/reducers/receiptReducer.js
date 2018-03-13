import * as c from '../constants/constants'

let receiptInitData = {
  receiptId : null,
  receiptData : [{food_name : 'Apple',
   price : '5$',
   count : '5',
   size : '32oz',
   category : 'Fruit',
   closest_category : 'Fruit'},
  {food_name : 'Orange',
   price : '5$',
   count : '5',
   size : '32oz',
   category : 'Fruit',
   closest_category : 'Fruit'},
  {food_name : 'Banana',
   price : '5$',
   count : '5',
   size : '32oz',
   category : 'Fruit',
   closest_category : 'Fruit'
 }]
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
