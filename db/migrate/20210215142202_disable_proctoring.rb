# frozen_string_literal: true

class DisableProctoring < ActiveRecord::Migration[5.2]
  def change
    CampaignOptions.update_all(proctoring_enabled: false)
  end
end
