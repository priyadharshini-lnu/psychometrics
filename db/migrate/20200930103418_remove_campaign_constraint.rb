# frozen_string_literal: true

class RemoveCampaignConstraint < ActiveRecord::Migration[5.1]
  def change
    remove_foreign_key :communications, column: :campaign_id
    remove_foreign_key :communications, column: :end_level_id
  end
end
