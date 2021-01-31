# frozen_string_literal: true

class AddCampaignIdToDatasheets < ActiveRecord::Migration[5.2]
  def change
    add_reference :datasheets, :campaign, foreign_key: { on_delete: :cascade }
  end
end
