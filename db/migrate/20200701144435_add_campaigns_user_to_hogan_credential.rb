# frozen_string_literal: true

class AddCampaignsUserToHoganCredential < ActiveRecord::Migration[5.1]
  def change
    add_reference :hogan_credentials, :campaigns_user, foreign_key: { on_delete: :cascade }
  end
end
