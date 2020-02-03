# frozen_string_literal: true

class AddStatusToCampaign < ActiveRecord::Migration[5.1]
  def change
    add_column :campaigns, :status, :integer, default: 0
  end
end
