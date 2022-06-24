export interface Migration {
  up(
    queryInterface: import('sequelize').QueryInterface,
    Sequelize: typeof import('sequelize')
  ): Promise<void>;
  down(
    queryInterface: import('sequelize').QueryInterface,
    Sequelize: typeof import('sequelize')
  ): Promise<void>;
}
