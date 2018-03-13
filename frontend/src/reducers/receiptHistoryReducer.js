import * as c from '../constants/constants'

let receiptHistoryInitData =[
    {
      'id' : 1,
      'timestamp' : 1520812333157,
      'wastageInfo' : '10%'
    },
    {
      'id' : 2,
      'timestamp' : 1520712332157
    },
    {
      'id' : 3,
      'timestamp' : 1520612331157,
      'wastageInfo' : '15%'
    },
    {
      'id' : 4,
      'timestamp' : 1520512330157,
      'wastageInfo' : '15%'
    }
  ]


export function receiptHistoryReducer(state=receiptHistoryInitData, action) {
  switch(action.type) {
      case c.SET_RECEIPT_HISTORY:
        return Object.assign({}, state, action.data);
      case c.REMOVE_RECEIPT:
        let itemId = action.item.id;
        let d = state.filter((a) => { return a.id != itemId});
        console.log(itemId, d)
        return d
      default:
        return state;
  }
}
