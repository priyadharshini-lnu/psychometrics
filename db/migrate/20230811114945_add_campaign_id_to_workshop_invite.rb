class AddCampaignIdToWorkshopInvite < ActiveRecord::Migration[7.0]
  def change
    add_reference :workshop_invites, :campaign, foreign_key: { on_delete: :cascade }
  end
end
