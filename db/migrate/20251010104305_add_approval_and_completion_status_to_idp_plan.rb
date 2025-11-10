# frozen_string_literal: true

class AddApprovalAndCompletionStatusToIdpPlan < ActiveRecord::Migration[7.1]
  def change
    change_table :user_idp_plans, bulk: true do |t|
      t.integer :approval_status, default: 0, null: false
      t.integer :completion_status, default: 0, null: false
    end
  end
end
