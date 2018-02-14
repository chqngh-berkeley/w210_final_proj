import {CRUD} from './CRUD';

const BASE_URL = 'http://localhost:8090'

export const api = {
  loginUser : function(username, password) {
    var d = {
      username : username,
      password: password
    }
    return CRUD.post(BASE_URL+'/login', d)
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
