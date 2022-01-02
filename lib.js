const config = require('./front/config')

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
      await Model.destroy({ where: { id: old.map((row) => row.id) } })
    }
  }
}
exports.deleteOldestForDemo = deleteOldestForDemo

// https://stackoverflow.com/questions/14382725/how-to-get-the-correct-ip-address-of-a-client-into-a-node-socket-io-app-hosted-o/14382990#14382990
// Works on Heroku 2021.
function getClientIp(req) {
  return req.header('x-forwarded-for')
}
exports.getClientIp = getClientIp

class ValidationError extends Error {
  constructor(errors, status) {
    super()
    this.errors = errors
    this.status = status
  }
}
exports.ValidationError = ValidationError

async function getIndexTags(sequelize) {
  return (
    await sequelize.models.Tag.findAll({
      order: [
        ['createdAt', 'DESC'],
        ['name', 'ASC'],
      ],
    })
  ).map((tag) => tag.name)
}
exports.getIndexTags = getIndexTags

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
      throw new ValidationError(
        {
          [prop]: [
            `validator ${validator.name} failed on ${prop} = "${param}"`,
          ],
        },
        422
      )
    }
  }
}
exports.validateParam = validateParam
