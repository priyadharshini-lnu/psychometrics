# frozen_string_literal: true

class AddFieldToIdpSettings < ActiveRecord::Migration[7.1]
  def change
    add_column :idp_settings, :require_all_development_actions_complete, :boolean, default: false
  end
end
