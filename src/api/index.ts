import {get, post, del} from './helpers'

const domain = "/api"
const getTasks = get(domain + '/logistic/tasks')
const getProducts = get(domain + '/product/products')
const getLocations = get(domain + 'logistic/locations')
const postLocation = post(domain + '/logistic/location')
const delLocation = del(domain + '/logistic/location')
const getTransportCosts = get(domain + '/logistic/matrix')
const postTransportCosts = post(domain + '/logistic/matrix')
const getVehicles = get(domain + '/logistic/vehicles')
const getDrivers = get(domain + '/logistic/drivers')
const getScenario = get(domain + '/logistic/scenario')
const postScenario = post(domain + '/logistic/scenario')
const getRecords = get(domain + '/logistic/records')
const getTemplate = get(domain + '/logistic/template')
const postTemplate = post(domain + '/logistic/template')
const getTemplateRecords = get(domain + '/logistic/template-records')
const getScenarioRecordByDate = get(domain + '/logistic/scenario-record')
const getRequirements = get(domain + "/logistic/requirements")

export {
  getTasks,
  getProducts,
  getLocations,
  postLocation,
  delLocation,
  getTransportCosts,
  postTransportCosts,
  getVehicles,
  getDrivers,
  getScenario,
  postScenario,
  getRecords,
  getTemplate,
  postTemplate,
  getTemplateRecords,
  getScenarioRecordByDate,
  getRequirements,
}
