module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.addIndex('User', ['createdAt'],
      {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      {transaction},
    )
  }),
  down: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async transaction => {
    await queryInterface.addColumn('User', 'ip',
      {
        type: Sequelize.STRING,
        defaultValue: '',
      },
      {transaction},
    )
  }),
};
