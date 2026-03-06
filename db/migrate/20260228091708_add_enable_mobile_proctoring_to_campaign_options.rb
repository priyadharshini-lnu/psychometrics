# frozen_string_literal: true

class AddEnableMobileProctoringToCampaignOptions < ActiveRecord::Migration[8.0]
  def change
    add_column :campaign_options, :enable_mobile_proctoring, :boolean, default: false
  end
end
