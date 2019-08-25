class AddArchivedStatusToAssessments < ActiveRecord::Migration[5.1]
  def change
    add_column :assessments, :archived, :boolean, default: false
  end
end
