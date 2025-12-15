# frozen_string_literal: true

class AddIntegrationTypeToSamlServiceProviders < ActiveRecord::Migration[8.0]
  def change
    add_column :saml_service_providers, :integration_type, :integer, default: 0, null: false
    add_index :saml_service_providers, :integration_type
  end
end
