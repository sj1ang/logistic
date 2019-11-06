import axios from 'axios';

const ERR_OK = 0;

let service = axios.create({

})

service.interceptors.request.use(function(config){
  config.headers["Content-Type"] = "application/json";
  config.headers.Accept = "application/json";
  return config;
})


export function get(url: string) {
  return function (params: any) {
    return service.get(url, params).then((res) =>{
      const {errcode, errmsg, data} = res.data;
      if(errcode == ERR_OK){
        return Promise.resolve(data);
      }else{
        return Promise.reject(errmsg);
      }
    })
  }
}

export function post(url: string) {
  return function (params: any) {
      return service.post(url, params).then((res) =>{
      const {errcode, errmsg, data} = res.data;
      if(errcode == ERR_OK){
        return Promise.resolve(data);
      }else{
        return Promise.reject(errmsg);
      }
    })
  }
}

export function del(url: string) {
  return function (params: any) {
    return service.delete(url, params).then((res) =>{
      const {errcode, errmsg, data} = res.data;
      if(errcode == ERR_OK){
        return Promise.resolve(data);
      }else{
        return Promise.reject(errmsg);
      }
    })
  }
}

