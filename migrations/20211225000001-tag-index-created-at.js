module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addIndex('Tag', {
        fields: ['createdAt'],
        transaction,
      })
    }),
  down: async (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeIndex('Tag', {
        fields: ['createdAt'],
        transaction,
      })
    }),
}
