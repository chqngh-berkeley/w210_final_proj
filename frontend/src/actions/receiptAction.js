import * as c from '../constants/constants'


export const setReceipt = (receipt) => {
  return {
    type: c.SET_RECEIPT,
    receipt
  }
}

export const setReceiptItem = (item) => {
  return {
    type: c.SET_RECEIPT_ITEM,
    item
  }
}

export const setAllReceipts = (receipts) => {
  return {
    type: c.SET_RECEIPT_HISTORY,
    receipts
  }
}
