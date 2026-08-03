# frozen_string_literal: true

class AddGlintUiToProjectFeatures < ActiveRecord::Migration[8.0]
  def change
    add_column :project_features, :glint_ui, :boolean, default: false, null: false
  end
end
