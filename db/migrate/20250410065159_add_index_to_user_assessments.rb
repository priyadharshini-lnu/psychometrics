# frozen_string_literal: true

class AddIndexToUserAssessments < ActiveRecord::Migration[7.1]
  def change
    add_index :user_assessments, %i[status expiry_date], name: 'idx_user_assessments_status_expiry_users_result_id',
include: [:users_result_id]
  end
end
