# frozen_string_literal: true

class AddLastApprovedAtToIdpPlan < ActiveRecord::Migration[7.1]
  def change
    add_column :user_idp_plans, :last_approved_at, :datetime
  end
end
