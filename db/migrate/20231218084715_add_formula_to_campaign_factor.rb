# frozen_string_literal: true

class AddFormulaToCampaignFactor < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_factors, :formula, :text
  end
end
