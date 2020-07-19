# frozen_string_literal: true

class AddCampaignUserIdTocommuncationEmail < ActiveRecord::Migration[5.1]
  def change
    add_reference :communication_emails, :campaigns_user, foreign_key: { on_delete: :cascade }
  end
end
