class AddColumnsToThreesixtySubjects < ActiveRecord::Migration[5.1]
  def change
    add_column :threesixty_subjects, :report_release_status, :integer, default: 0
    add_column :threesixty_subjects, :evaluation_status, :integer, default: 0
  end
end
