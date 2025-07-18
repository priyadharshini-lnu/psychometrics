# frozen_string_literal: true

class AddIdpToClientFeatures < ActiveRecord::Migration[7.1]
  def change
    add_column :client_features, :idp, :boolean, default: false, null: false
  end
end
