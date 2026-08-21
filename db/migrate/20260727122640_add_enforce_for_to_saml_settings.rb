# frozen_string_literal: true

class AddEnforceForToSamlSettings < ActiveRecord::Migration[8.0]
  def change
    change_table :saml_settings, bulk: true do |t|
      t.integer :enforce_for, default: 0, null: false
      t.text :enforced_domains, array: true, default: []
    end
  end
end
