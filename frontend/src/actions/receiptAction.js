import * as c from '../constants/constants'


export const setReceiptId = (r_id) => {
  return {
    type: c.SET_RECEIPT_ID,
    receiptId : r_id
  }
}

export const setReceiptData = (receiptData) => {
  return {
    type: c.NEW_RECEIPT_DATA,
    receiptData
  }
}

export const removeReceiptFromHistory = (item) => {
  return {
    type: c.REMOVE_RECEIPT,
    item : item
  }
}
