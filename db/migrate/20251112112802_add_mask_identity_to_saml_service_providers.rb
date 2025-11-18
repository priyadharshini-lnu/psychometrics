# frozen_string_literal: true

class AddMaskIdentityToSamlServiceProviders < ActiveRecord::Migration[8.0]
  def change
    add_column :saml_service_providers, :mask_identity, :boolean, default: false, null: false
  end
end
