# frozen_string_literal: true

class MoveStatusAndNormColumnsToUserAssessment < ActiveRecord::Migration[5.2]
  def change
    add_reference :user_assessments, :norm, foreign_key: { on_delete: :nullify, to_table: :norms }
    add_column :user_assessments, :norm_type, :string
    add_column :user_assessments, :status, :integer, default: 0
    add_column :user_assessments, :completed_at, :datetime
    add_column :user_assessments, :completion_reason, :integer

    UserAssessment.reset_column_information

    UsersResult.includes(:user_assessment).find_each do |users_result|
      users_result.user_assessment&.update_columns(
        norm_id: users_result.read_attribute(:norm_id),
        norm_type: users_result.read_attribute(:norm_type),
        status: users_result.read_attribute(:status),
        completed_at: users_result.read_attribute(:completed_at),
        completion_reason: users_result.read_attribute(:completion_reason)
      )
    end

    remove_column :users_results, :norm_id
    remove_column :users_results, :norm_type
    remove_column :users_results, :completed_at
    remove_column :users_results, :status
    remove_column :users_results, :completion_reason
  end
end
