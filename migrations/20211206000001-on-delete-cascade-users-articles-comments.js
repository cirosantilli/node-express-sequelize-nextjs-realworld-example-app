module.exports = {
  // https://github.com/sequelize/sequelize/issues/12789
  up: async (queryInterface) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('Article', 'authorId', {
        onDelete: 'CASCADE',
        transaction,
      })
      await queryInterface.changeColumn('Comment', 'articleId', {
        onDelete: 'CASCADE',
        transaction,
      })
      await queryInterface.changeColumn('Comment', 'authorId', {
        onDelete: 'CASCADE',
        transaction,
      })
    }),
  down: async (queryInterface) =>
    queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.changeColumn('Article', 'authorId', {
        onDelete: 'NO ACTION',
        transaction,
      })
      await queryInterface.changeColumn('Comment', 'articleId', {
        onDelete: 'NO ACTION',
        transaction,
      })
      await queryInterface.changeColumn('Comment', 'authorId', {
        onDelete: 'NO ACTION',
        transaction,
      })
    }),
}
