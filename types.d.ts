import type { QueryInterface } from 'sequelize';

export interface Migration {
  up(
    queryInterface: QueryInterface,
    Sequelize: typeof import('sequelize')
  ): Promise<void>;
  down(
    queryInterface: QueryInterface,
    Sequelize: typeof import('sequelize')
  ): Promise<void>;
}
