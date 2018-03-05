import {CRUD} from './CRUD';

const BASE_URL = 'http://0.0.0.0:8090'
// const BASE_URL = 'http://50.97.219.169'
export const api = {
  loginUser : function(username, password) {
    var d = {
      username : username,
      password: password
    }
    return CRUD.post(BASE_URL+'/user/login', d)
  },
  signup : function(username, password, email) {
    var d = {
      username : username,
      password: password,
      email: email
    }
    return CRUD.post(BASE_URL+'/user/save', d).then(res => res.json())
  },
  submitFileUpload : function(f) {
    let data = new FormData();
    data.append('upload', f);
    return CRUD.postFile(BASE_URL+'/receipt/upload_receipt', data).then(res => res.json())
  },
  getReceiptDataById : function(receiptId) {
    return CRUD.get(BASE_URL+'/receipt/'+receiptId).then(res => res.json())
  }
}
