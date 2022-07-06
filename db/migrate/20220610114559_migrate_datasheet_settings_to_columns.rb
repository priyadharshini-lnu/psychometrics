# frozen_string_literal: true

class MigrateDatasheetSettingsToColumns < ActiveRecord::Migration[5.2]
  def up
    Datasheet.all.each do |datasheet|
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
