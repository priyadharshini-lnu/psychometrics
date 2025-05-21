# frozen_string_literal: true

class AddColumnsToUserIdpPlan < ActiveRecord::Migration[7.1]
  def change
    # rubocop:disable Rails/BulkChangeTable
    add_column :user_idp_plans, :completed_at, :datetime
    add_column :user_idp_plans, :started_at, :datetime
    # rubocop:enable Rails/BulkChangeTable
  end
end
