module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SequelizeMeta',
      {
        name: {
          type: Sequelize.DataTypes.STRING,
          primaryKey: true,
          unique: true,
          allowNull: false,
        },
      },
      {
        timestamps: false,
      },
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SequelizeMeta');
  }
};
