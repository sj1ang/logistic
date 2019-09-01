import axios, {AxiosRequestConfig} from 'axios';

const ERR_OK = 0;

export function get(url: string) {
  return function (params: AxiosRequestConfig) {
    return axios.get(url, params).then((res) =>{
      const {errcode, errmsg, data} = res.data;
      if(errcode == ERR_OK){
        return Promise.resolve(data);
      }else{
        return Promise.reject(errmsg);
      }
    })
  }
}
