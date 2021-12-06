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
