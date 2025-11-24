# frozen_string_literal: true

class CreateSamlServiceProviders < ActiveRecord::Migration[8.0]
  def change
    create_table :saml_service_providers do |t|
      t.string :name, null: false
      t.string :entity_id, null: false
      t.text :acs_urls, array: true, default: []
      t.text :certificate
      t.text :encrypted_idp_certificate
      t.text :encrypted_idp_private_key
      t.boolean :enabled, default: true, null: false
      t.boolean :require_signed_requests, default: false, null: false
      t.references :project, null: false, foreign_key: { to_table: :clients }

      t.timestamps
    end

    add_index :saml_service_providers, %i[entity_id project_id], unique: true, if_not_exists: true
  end
end
