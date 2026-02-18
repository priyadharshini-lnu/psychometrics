# frozen_string_literal: true

class AddApprovalFieldsToUserAssessments < ActiveRecord::Migration[8.0]
  def change
    change_table :user_assessments, bulk: true do |t|
      t.string :approval_status, default: 'pending'
      t.datetime :approval_status_updated_at
      t.bigint :score_assessed_by_id
      t.bigint :score_approved_by_id
      t.datetime :score_assessed_at
      t.datetime :score_approved_at
    end
  end
end
