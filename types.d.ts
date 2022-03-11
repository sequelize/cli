export {};

declare global {
  namespace SequelizeCLI {
    type ScriptFunction = (
      sql: import("sequelize").QueryInterface,
      sequelize: typeof import("sequelize")
    ) => Promise<void>;

    interface Migration {
      up: ScriptFunction;
      down: ScriptFunction;
    }

    interface Seeder {
      up: ScriptFunction;
      down: ScriptFunction;
    }
  }
}
