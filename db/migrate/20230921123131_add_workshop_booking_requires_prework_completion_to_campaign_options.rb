class AddWorkshopBookingRequiresPreworkCompletionToCampaignOptions < ActiveRecord::Migration[7.0]
  def change
    add_column :campaign_options, :workshop_booking_requires_prework_completion, :boolean, default: false
  end
end
