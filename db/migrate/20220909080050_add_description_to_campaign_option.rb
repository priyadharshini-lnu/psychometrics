# frozen_string_literal: true

class AddDescriptionToCampaignOption < ActiveRecord::Migration[6.1]
  def change
    add_column :campaign_options, :description, :text
    add_column :campaign_option_translations, :description, :text
  end
end

