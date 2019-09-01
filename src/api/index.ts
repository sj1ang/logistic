import {get} from './helpers'

const domain = "/api"
const getTasks = get(domain + '/logistic/tasks')
const getProducts = get(domain + '/product/products')
const getLocations = get(domain + 'logistic/locations')

export {
  getTasks,
  getProducts,
  getLocations
}
