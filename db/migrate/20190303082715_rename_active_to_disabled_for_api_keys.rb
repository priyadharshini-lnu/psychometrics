# frozen_string_literal: true

class RenameActiveToDisabledForApiKeys < ActiveRecord::Migration[5.1]
  def up
    rename_column :api_keys, :active, :disabled
    change_column :api_keys, :disabled, :boolean, default: false
  end

  def down
    change_column :api_keys, :disabled, :boolean
    rename_column :api_keys, :disabled, :active
  end
end
