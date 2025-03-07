# frozen_string_literal: true

class AddWorkshopInviteRequiresPreworkCompletionToCampaignOptions < ActiveRecord::Migration[7.1]
  def change
    add_column :campaign_options, :workshop_invite_requires_prework_completion, :boolean, default: false
  end
end
