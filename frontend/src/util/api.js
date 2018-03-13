import {CRUD} from './CRUD';

const BASE_URL = 'http://0.0.0.0:8090'
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
    return CRUD.put(BASE_URL+'/user/'+user_id, info).then(res => res.json())
  },



  // upload receipt
  submitFileUpload : function(f) {
    let data = new FormData();
    data.append('upload', f);
    return CRUD.postFile(BASE_URL+'/receipt/upload_receipt', data).then(res => res.json())
  },
  getReceiptDataById : function(receiptId) {
    return CRUD.get(BASE_URL+'/receipt/'+receiptId).then(res => res.json())
  },

  updateReceiptDataById : function(receiptId, info) {
    return CRUD.put(BASE_URL+'/receipt/'+receiptId, info).then(res => res.json())
  },

  deleteReceiptDataById : function(receiptId) {
    return CRUD.del(BASE_URL+'/receipt/'+receiptId).then(res => res.json())
  },

  // receipt history
  getAllReceipts : function(userId) {
    return CRUD.get(BASE_URL+'/receipt/all', userId).then(res => res.json())
  },

  // Grocery list
  getGroceryListRecommendations : function(userId, count) {
    let params = {
      user_id : userId,
      count : count
    }
    return CRUD.get(BASE_URL+'/grocery', params).then(res => res.json())
  },

  updateGroceryList : function(userId, items) {
    return CRUD.put(BASE_URL+'/grocery', items).then(res => res.json())
  }
}
