# frozen_string_literal: true

class RenameCommunicatiosCreatorId < ActiveRecord::Migration[5.2]
  def change
    rename_column :communications, :creator_id, :created_by_id
  end
end
