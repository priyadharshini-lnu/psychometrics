class AddCampaignToCommunications < ActiveRecord::Migration[5.0]
  def change
    add_reference :communications, :campaign, foreign_key: { on_delete: :cascade, to_table: :clients }
  end
end
