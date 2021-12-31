module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'User',
        'ip',
        {
          type: Sequelize.STRING,
          defaultValue: '',
        },
        { transaction }
      )
    }),
  down: async (queryInterface) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('User', 'ip', { transaction })
    }),
}
