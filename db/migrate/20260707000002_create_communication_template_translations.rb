# frozen_string_literal: true

class CreateCommunicationTemplateTranslations < ActiveRecord::Migration[7.1]
  def change
    # This is a Mobility translation join table. Like every other Mobility translation table in this
    # app, it needs its own `tenant_id` column so ActsAsTenant's default scope can filter it directly
    # (config/initializers/mobility_translation_tenantable.rb injects Tenantable into every Mobility
    # translation class, and acts_as_tenant requires a real column to scope reads by -- deriving the
    # tenant via the communication_template_id FK at write time is not sufficient for reads). That
    # column is added by a follow-up migration (20260729120001) rather than here, since this migration
    # was already applied before the gap was discovered.
    # rubocop:disable CustomRubocops/CreateTableMigrationRequiresTenantId
    create_table :communication_template_translations do |t|
      t.string :subject
      t.text   :body

      t.string :locale, null: false
      t.references :communication_template, null: false, foreign_key: true, index: false

      t.timestamps null: false
    end
    # rubocop:enable CustomRubocops/CreateTableMigrationRequiresTenantId

    add_index :communication_template_translations, :locale,
              name: :index_communication_template_translations_on_locale
    add_index :communication_template_translations, %i[communication_template_id locale],
              name: :index_comm_template_translations_on_template_and_locale, unique: true
  end
end
