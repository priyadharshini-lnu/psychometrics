class AddRequireSchedulingToUserAssessments < ActiveRecord::Migration[7.0]
  def change
    add_column :user_assessments, :require_scheduling, :boolean, default: false
  end
end
