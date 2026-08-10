# frozen_string_literal: true

class AddGlintUiToClientFeatures < ActiveRecord::Migration[8.0]
  def change
    add_column :client_features, :glint_ui, :boolean, default: false, null: false
  end
end
