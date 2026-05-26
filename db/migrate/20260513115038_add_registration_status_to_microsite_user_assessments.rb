# frozen_string_literal: true

class AddRegistrationStatusToMicrositeUserAssessments < ActiveRecord::Migration[8.0]
  def change
    change_table :microsite_user_assessments, bulk: true do |t|
      t.integer :registration_status, default: 0, null: false
      t.text :error_message
    end
  end
end
