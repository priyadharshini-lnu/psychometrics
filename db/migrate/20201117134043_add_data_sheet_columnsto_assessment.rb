# frozen_string_literal: true

class AddDataSheetColumnstoAssessment < ActiveRecord::Migration[5.1]
  def change
    add_column :assessments, :data_sheet_columns, :jsonb, null: false, default: []
  end
end
