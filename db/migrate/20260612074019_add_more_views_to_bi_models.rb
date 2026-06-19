# frozen_string_literal: true

class AddMoreViewsToBiModels < ActiveRecord::Migration[8.0]
  def up
    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.clients;

      CREATE VIEW bi_models.clients AS
      SELECT
        id,
        name
      FROM
        clients
      WHERE ancestry_depth = 0
    SQL

    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.projects;

      CREATE VIEW bi_models.projects AS
      SELECT
        id,
        name,
        tte_id as client_id
      FROM
        clients
      WHERE ancestry_depth = 1
    SQL
  end

  def down
    execute <<-SQL.squish
      DROP VIEW IF EXISTS bi_models.clients;
      DROP VIEW IF EXISTS bi_models.projects;
    SQL
  end
end
