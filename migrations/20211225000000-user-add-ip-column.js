module.exports = {
  up: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async transaction => {
    queryInterface.addIndex('Tag', { fields: ['createdAt'] }, { transaction });
  }),
  down: async (queryInterface, Sequelize) => queryInterface.sequelize.transaction(async transaction => {
    queryInterface.removeIndex('Tag', { fields: ['createdAt'] }, { transaction });
  })
};
