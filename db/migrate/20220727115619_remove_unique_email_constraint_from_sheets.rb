# frozen_string_literal: true

class RemoveUniqueEmailConstraintFromSheets < ActiveRecord::Migration[6.1]
  def change
    remove_index :sheet_rows, %i[email sheet_id]
  end
end
