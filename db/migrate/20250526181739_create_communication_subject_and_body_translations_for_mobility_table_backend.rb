# frozen_string_literal: true

class CreateCommunicationSubjectAndBodyTranslationsForMobilityTableBackend < ActiveRecord::Migration[7.1]
  def change
    create_table :communication_translations do |t|
      t.string :subject
      t.text :body

      t.string :locale, null: false
      t.references :communication, null: false, foreign_key: true, index: false

      t.timestamps null: false
    end

    add_index :communication_translations, :locale, name: :index_communication_translations_on_locale
    add_index :communication_translations, %i[communication_id locale],
              name: :index_d7f2c041d1fd872ae4c401b79ce81a4ed229f121, unique: true

    reversible do |dir|
      dir.up do
        sql = <<~SQL.squish
          INSERT INTO communication_translations (locale, subject, body, communication_id, created_at, updated_at)
          SELECT 'en' as locale, communications.subject, communications.body, communications.id, NOW(), NOW()
          FROM communications
          WHERE communications.subject IS NOT NULL OR communications.body IS NOT NULL
        SQL
        execute(sql)
      end
      dir.down do
        execute('DELETE FROM communication_translations')
      end
    end
  end
end
