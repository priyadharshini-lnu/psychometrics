class CreateClientPrivacySettings < ActiveRecord::Migration[7.1]
  def change
    create_table :client_privacy_settings do |t|
      t.references :client, foreign_key: { on_delete: :cascade }, null: false
      t.boolean :disable_data_processing, default: false
    end

    reversible do |dir|
      dir.up do
        sql = <<~SQL
          INSERT INTO client_privacy_settings (client_id, disable_data_processing)
          SELECT clients.id, false FROM clients
          WHERE clients.ancestry_depth = 0
        SQL
        execute(sql)
      end
    end
  end
end
