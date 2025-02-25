# frozen_string_literal: true

class CreateIdpSettings < ActiveRecord::Migration[7.1]
  def change
    create_table :idp_settings do |t|
      t.boolean :allow_global_skills, default: false
      t.boolean :manager_approves_idp, default: false
      t.boolean :manager_can_edit_idp, default: false

      t.timestamps
    end

    add_reference :idp_settings, :project, foreign_key: { on_delete: :cascade, to_table: :clients }

    ActiveRecord::Base.connection.execute('SELECT * from clients where ancestry_depth = 1').each do |client|
      sql = <<~SQL.squish
        INSERT INTO idp_settings (project_id, created_at, updated_at)
        VALUES ($1, NOW(), NOW())
      SQL
      exec_query(sql, 'SQL', [client['id']])
    end
  end
end
