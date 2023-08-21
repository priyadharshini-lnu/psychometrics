# frozen_string_literal: true

class AddUniqIndexForCampaignIdAndUserIdOnWorkshopSubject < ActiveRecord::Migration[7.0]
  def change
    add_index :workshop_subjects, %i[workshop_id user_id], unique: true
  end
end
