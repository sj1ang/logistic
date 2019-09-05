import {get} from './helpers'

const domain = "/api"
const getTasks = get(domain + '/logistic/tasks')
const getProducts = get(domain + '/product/products')
const getLocations = get(domain + 'logistic/locations')
const getTransportCosts = get(domain + '/logistic/matrix')
const getVehicles = get(domain + '/logistic/vehicles')
const getDrivers = get(domain + '/logistic/drivers')

export {
  getTasks,
  getProducts,
  getLocations,
  getTransportCosts,
  getVehicles,
  getDrivers
}
