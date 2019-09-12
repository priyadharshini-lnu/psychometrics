# frozen_string_literal: true

class RemoveUniqIndexFromLicenses < ActiveRecord::Migration[5.1]
  def change
    remove_index :licenses, %i[client_id report_family_id]
    add_index :licenses, %i[client_id report_family_id]
  end
end
