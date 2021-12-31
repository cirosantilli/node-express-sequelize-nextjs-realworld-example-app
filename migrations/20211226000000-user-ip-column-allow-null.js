module.exports = {
  up: async (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'User',
        'ip',
        {
          type: Sequelize.DataTypes.STRING,
          defaultValue: undefined,
        },
        { transaction }
      )
      await queryInterface.bulkUpdate(
        'User',
        { ip: null },
        { ip: '' },
        { transaction }
      )
    }),
  down: async (queryInterface, Sequelize) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn(
        'User',
        'ip',
        {
          type: Sequelize.DataTypes.STRING,
          defaultValue: '',
        },
        { transaction }
      )
      await queryInterface.bulkUpdate(
        'User',
        { ip: '' },
        { ip: null },
        { transaction }
      )
    }),
}
