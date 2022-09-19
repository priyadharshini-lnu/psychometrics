# frozen_string_literal: true

class AddPrimaryColorToDesignSettings < ActiveRecord::Migration[5.2]
  def change
    add_column :design_settings, :primary_color, :string
    add_column :design_settings, :error_color, :string
    add_column :design_settings, :warning_color, :string
    add_column :design_settings, :success_color, :string
    add_column :design_settings, :info_color, :string
  end
end
