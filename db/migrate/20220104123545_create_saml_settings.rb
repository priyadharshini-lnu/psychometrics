# frozen_string_literal: true

class CreateSamlSettings < ActiveRecord::Migration[5.2]
  def change
    create_table :saml_settings do |t|
      t.boolean :verified, default: false
      t.boolean :enabled, default: false
      t.boolean :enforced, default: false
      t.string :entity_id
      t.string :sso_service_url
      t.string :after_signout_url
      t.text :cert
      t.jsonb :test_settings, default: {}

      t.timestamps
    end

    add_reference :saml_settings, :project, foreign_key: { on_delete: :cascade, to_table: :clients }, null: false

    Client.projects.find_each(&:create_saml_setting)
  end
end
