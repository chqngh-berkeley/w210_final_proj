import fetch from 'isomorphic-fetch';

function getCRUDSetting(type, user_id) {
  return {
    headers:{
     'Content-Type': 'application/json',
     'user_id': user_id ? user_id : null
    },
    method: type,
    // mode: 'cors',
    cache: 'default'
  };
}

function getFileCRUDSetting(type, user_id) {

  return {
    headers:{
      'user_id': user_id ? user_id : null
    },
    method: type
  };
}

function appendQueryParams(params) {
  var esc = encodeURIComponent;
  var query = Object.keys(params)
      .map(k => esc(k) + '=' + esc(params[k]))
      .join('&');
 return '?'+query;
}

export const CRUD = {
  get(url, params, user_id) {
    var cs = getCRUDSetting('GET', user_id);
    let p = {
      'user_id' : user_id
    }
    if(params) {
      url += appendQueryParams(Object.assign({}, params, p));
    }else{
      url += appendQueryParams(p);
    }

    return fetch(url, cs);
  },

  post(url, data, user_id, params) {
    var cs = getCRUDSetting('POST', user_id);
    cs.body = JSON.stringify(data);
    if(params) {
      url += appendQueryParams(params);
      return fetch(url, cs);
    }
    let p = {
      'user_id' : user_id
    }
    url += appendQueryParams(p);

    return fetch(url, cs);
  },

  postFile(url, data, user_id) {
    var cs = getFileCRUDSetting('POST', user_id);
    cs.body = data;
    let p = {
      'user_id' : user_id
    }
    url += appendQueryParams(p);
    return fetch(url, cs);
  },
  put(url, data, user_id) {
    var cs = getCRUDSetting('PUT', user_id);
    cs.body = JSON.stringify(data);
    let p = {
      'user_id' : user_id
    }
    url += appendQueryParams(p);
    return fetch(url, cs);
  },
  del(url, user_id) {
    var cs = getCRUDSetting('DELETE', user_id);
    let p = {
      'user_id' : user_id
    }
    url += appendQueryParams(p);
    return fetch(url, cs);
  }
};
