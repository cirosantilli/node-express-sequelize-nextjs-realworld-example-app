const config = require('./config.js')

async function deleteOldestForDemo(Model) {
  if (config.isDemo) {
    // Delete the oldest comments to keep data size limited.
    const old = await Model.findAll({
      order: [['createdAt', 'DESC']],
      offset: config.demoMaxObjs,
      limit: config.maxObjsInMemory,
      attributes: ['id'],
    })
    if (old.length) {
      await Model.destroy({ where: { id: old.map(row => row.id) } })
    }
  }
}
exports.deleteOldestForDemo = deleteOldestForDemo

function validatePositiveInteger(s) {
  const i = Number(s)
  let ok = s !== '' && Number.isInteger(i) && i >= 0
  return [i, ok]
}
exports.validatePositiveInteger = validatePositiveInteger

function validateParam(obj, prop, validator, defaultValue) {
  let param = obj[prop]
  if (typeof param === 'undefined') {
    return defaultValue
  } else {
    let [val, ok] = validator(param)
    if (ok) {
      return val
    } else {
      throw {
        errors: [`validator ${validator.name} failed on ${prop} = "${param}"`],
        status: 422,
      }
    }
  }
}
exports.validateParam = validateParam
