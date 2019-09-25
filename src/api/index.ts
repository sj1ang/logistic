import {get, post} from './helpers'

const domain = "/api"
const getTasks = get(domain + '/logistic/tasks')
const getProducts = get(domain + '/product/products')
const getLocations = get(domain + 'logistic/locations')
const getTransportCosts = get(domain + '/logistic/matrix')
const getVehicles = get(domain + '/logistic/vehicles')
const getDrivers = get(domain + '/logistic/drivers')
const getScenario = get(domain + '/logistic/scenario')
const postScenario = post(domain + '/logistic/scenario')
const getRecords = get(domain + '/logistic/records')
const getTemplate = get(domain + '/logistic/template')
const postTemplate = post(domain + '/logistic/template')
const getTemplateRecords = get(domain + '/logistic/template-records')
const getScenarioRecordByDate = get(domain + '/logistic/scenario-record')

export {
  getTasks,
  getProducts,
  getLocations,
  getTransportCosts,
  getVehicles,
  getDrivers,
  getScenario,
  postScenario,
  getRecords,
  getTemplate,
  postTemplate,
  getTemplateRecords,
  getScenarioRecordByDate,
}
