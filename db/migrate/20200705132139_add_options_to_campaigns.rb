# frozen_string_literal: true

class AddOptionsToCampaigns < ActiveRecord::Migration[5.1]
  def change
    add_column :campaigns, :options, :jsonb, default: {}
  end
end
