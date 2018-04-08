import {CRUD} from './CRUD';
import {BASE_URL, BASE_HOST} from '../constants/constants'

// const BASE_URL = 'http://50.97.219.169'
export const api = {

  // User info
  loginUser : function(username, password) {
    var d = {
      username : username,
      password: password
    }
    return CRUD.post(BASE_URL+'/user/login', d).then(res => res.json())
  },

  signup : function(info) {
    return CRUD.post(BASE_URL+'/user', info).then(res => res.json())
  },

  updateUserInfo : function(user_id, info) {
    return CRUD.put(BASE_URL+'/user/'+user_id, info, user_id).then(res => res.json())
  },
  getUserInfo : function(user_id) {
    return CRUD.get(BASE_URL+'/user/'+user_id, {}, user_id).then(res => res.json())
  },



  // upload receipt
  submitFileUpload : function(userId, f) {
    let data = new FormData();
    data.append('upload', f);
    return CRUD.postFile(BASE_URL+'/receipt/upload_receipt', data, userId).then(res => res.json())
  },
  getReceiptDataById : function(userId, receiptId) {
    return CRUD.get(BASE_URL+'/receipt/'+receiptId, {}, userId).then(res => res.json())
  },

  getReceiptImageById : function(path) {
    return CRUD.get(BASE_URL+'/receipt_image/'+path, {}, null).then(res => res.json())
  },

  updateReceiptDataById : function(userId,receiptId, info) {
    return CRUD.put(BASE_URL+'/receipt/'+receiptId, info, userId).then(res => res.json())
  },

  deleteReceiptDataById : function(userId, receiptId) {
    return CRUD.del(BASE_URL+'/receipt/'+receiptId, userId).then(res => res.json())
  },

  // receipt history
  getAllReceipts : function(userId) {
    return CRUD.get(BASE_URL+'/receipt/all', {}, userId).then(res => res.json())
  },

  // wastage info
  getWastageDataById : function(userId, receiptId) {
    return CRUD.get(BASE_URL+'/wastage/'+receiptId, {}, userId).then(res => res.json())
  },

  updateWastageDataById : function(userId,receiptId, info) {
    return CRUD.put(BASE_URL+'/wastage/'+receiptId, {'data': info}, userId).then(res => res.json())
  },

  // Grocery list
  getGroceryListRecommendations : function(userId, threshold) {
    let data ={
      threshold : threshold
    }
    return CRUD.get(`${BASE_URL}/grocery/predict`, data, userId).then(res => res.json())
  },
  trainModel : function() {
    return CRUD.get(`${BASE_URL}/grocery/train`, {}, null).then(res => res.json())
  },

  getGroceryItemSuggestions : function(userId, count) {
    return CRUD.get(BASE_URL+'/grocery/suggested', {}, userId).then(res => res.json())
  },

  updateGroceryList : function(userId, items) {
    return CRUD.put(BASE_URL+'/grocery', items, userId).then(res => res.json())
  }
}
