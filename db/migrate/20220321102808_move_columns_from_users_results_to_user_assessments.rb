# frozen_string_literal: true

class MoveColumnsFromUsersResultsToUserAssessments < ActiveRecord::Migration[5.2]
  def change
    add_column :user_assessments, :reset_count, :integer, default: 0
    add_column :user_assessments, :expiry_date, :datetime
    add_column :user_assessments, :additional_time, :integer
    add_column :user_assessments, :selected_locale, :string
    add_column :user_assessments, :started_at, :datetime
    add_column :user_assessments, :last_activity_at, :datetime

    ActiveRecord::Migration[5.1].execute(
      <<-SQL.squish
      UPDATE user_assessments
      SET reset_count = users_results.reset_count,
      expiry_date = users_results.expiry_date,
      additional_time = users_results.additional_time,
      selected_locale = users_results.selected_locale,
      started_at = users_results.started_at,
      last_activity_at = users_results.last_activity_at
      FROM users_results
      WHERE user_assessments.users_result_id = users_results.id
      SQL
    )

    remove_column :users_results, :reset_count
    remove_column :users_results, :expiry_date
    remove_column :users_results, :additional_time
    remove_column :users_results, :selected_locale
    remove_column :users_results, :started_at
    remove_column :users_results, :last_activity_at
  end
end
