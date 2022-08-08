# frozen_string_literal: true

class OldDatasheet < ApplicationRecord
  self.table_name = 'datasheets'
  self.inheritance_column = :_type_disabled
end

class MigrateDatasheetSettingsToColumns < ActiveRecord::Migration[5.2]
  def up
    OldDatasheet.all.each do |datasheet|
      columns = datasheet.columns.map do |field, type|
        {
          name: field,
          type: type,
          accessor_access: true,
          dashboard_use: false,
          visible_in_list: false
        }
      end
      datasheet.update!(columns: columns)
    end
  end
end
