# frozen_string_literal: true

class AddSuperadminScopingToClientFeatures < ActiveRecord::Migration[8.0]
  def change
    add_column :client_features, :superadmin_tenant_scoping, :boolean, default: true, null: false
  end
end
