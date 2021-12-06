module.exports = {
  // https://github.com/sequelize/sequelize/issues/12789
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Article', 'authorId', { onDelete: 'CASCADE' })
    await queryInterface.changeColumn('Comment', 'articleId', { onDelete: 'CASCADE' })
    await queryInterface.changeColumn('Comment', 'authorId', { onDelete: 'CASCADE' })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Article', 'authorId', { onDelete: 'NO ACTION' })
    await queryInterface.changeColumn('Comment', 'articleId', { onDelete: 'NO ACTION' })
    await queryInterface.changeColumn('Comment', 'authorId', { onDelete: 'NO ACTION' })
  }
};
