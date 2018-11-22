class AddEnableProgressToAssessments < ActiveRecord::Migration[5.1]
  def change
    add_column :assessments, :enable_progress, :boolean, default: true
  end
end
