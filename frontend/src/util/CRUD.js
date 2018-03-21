import fetch from 'isomorphic-fetch';

function getCRUDSetting(type) {
  return {
    headers:{
     'Content-Type': 'application/json',
     'user_id': 'blarg'
    },
    method: type,
    // mode: 'cors',
    cache: 'default'
  };
}

function getFileCRUDSetting(type) {

  return {
    headers:{

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
  get(url, params) {
    var cs = getCRUDSetting('GET');
    if(params) {
      url += appendQueryParams(params);
    }
    return fetch(url, cs);
  },

  post(url, data) {
    var cs = getCRUDSetting('POST');
    cs.body = JSON.stringify(data);
    return fetch(url, cs);
  },

  postFile(url, data) {
    var cs = getFileCRUDSetting('POST');
    cs.body = data;
    return fetch(url, cs);
  },
  put(url, data) {
    var cs = getCRUDSetting('PUT');
    cs.body = JSON.stringify(data);
    return fetch(url, cs);
  },
  del(url) {
    var cs = getCRUDSetting('DELETE');
    return fetch(url, cs);
  }
};
