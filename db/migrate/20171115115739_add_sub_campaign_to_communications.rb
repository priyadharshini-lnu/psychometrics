# frozen_string_literal: true

class AddSubCampaignToCommunications < ActiveRecord::Migration[5.0]
  def change
    add_reference :communications, :sub_campaign, foreign_key: { on_delete: :cascade, to_table: :clients }
  end
end
