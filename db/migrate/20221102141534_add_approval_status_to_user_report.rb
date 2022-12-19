# frozen_string_literal: true

class AddApprovalStatusToUserReport < ActiveRecord::Migration[6.1]
  def change
    add_column :user_reports, :approval_status, :string, default: :not_ready
    add_column :user_reports, :approval_status_updated_at, :datetime
    add_reference :user_reports, :approval_status_owner, foreign_key: { on_delete: :cascade, to_table: :users }
  end
end
