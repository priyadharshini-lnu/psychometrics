# frozen_string_literal: true

class AddIntegrationTypeToCampaignOptions < ActiveRecord::Migration[6.1]
  def up
    add_column :campaign_options, :integration_type, :integer, null: false, default: 0
  end

  def down
    remove_column :campaign_options, :integration_type
  end
end
