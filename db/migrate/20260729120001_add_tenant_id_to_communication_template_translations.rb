# frozen_string_literal: true

class AddTenantIdToCommunicationTemplateTranslations < ActiveRecord::Migration[7.1]
  def change
    add_column :communication_template_translations, :tenant_id, :bigint
    add_index :communication_template_translations, :tenant_id
    add_foreign_key :communication_template_translations, :clients, column: :tenant_id
  end
end
