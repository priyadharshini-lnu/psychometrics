# frozen_string_literal: true

class AddUniqueIndexToMaintenanceSettingsSubSystem < ActiveRecord::Migration[8.0]
  def change
    add_index :maintenance_settings, :sub_system, unique: true
  end
end
