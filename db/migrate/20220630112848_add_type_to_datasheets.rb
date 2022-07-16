# frozen_string_literal: true

class AddTypeToDatasheets < ActiveRecord::Migration[5.2]
  def change
    add_column :datasheets, :type, :string, default: 'Datasheet'
    add_index :datasheets, :type
  end
end
