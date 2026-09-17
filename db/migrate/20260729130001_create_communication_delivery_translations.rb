# frozen_string_literal: true

class CreateCommunicationDeliveryTranslations < ActiveRecord::Migration[7.1]
  def change
    create_table :communication_delivery_translations do |t|
      t.string :subject
      t.text :body

      t.string :locale, null: false
      t.references :communication_delivery, null: false, foreign_key: true, index: false
      t.bigint :tenant_id

      t.timestamps null: false
    end

    add_index :communication_delivery_translations, :locale
    add_index :communication_delivery_translations, %i[communication_delivery_id locale], unique: true
    add_index :communication_delivery_translations, :tenant_id
    add_foreign_key :communication_delivery_translations, :clients, column: :tenant_id

    reversible do |dir|
      dir.up do
        sql = <<~SQL.squish
          INSERT INTO communication_delivery_translations
            (locale, subject, body, communication_delivery_id, tenant_id, created_at, updated_at)
          SELECT 'en' AS locale, communication_deliveries.subject, communication_deliveries.body,
                 communication_deliveries.id, communication_deliveries.tenant_id, NOW(), NOW()
          FROM communication_deliveries
          WHERE communication_deliveries.subject IS NOT NULL OR communication_deliveries.body IS NOT NULL
        SQL
        execute(sql)
      end
      dir.down do
        execute('DELETE FROM communication_delivery_translations')
      end
    end
  end
end
