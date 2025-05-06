# frozen_string_literal: true

class AddColumnsToUserIdpPlan < ActiveRecord::Migration[7.1]
  def change
    add_column :user_idp_plans, :completed_at, :datetime
    add_column :user_idp_plans, :started_at, :datetime
  end
end
