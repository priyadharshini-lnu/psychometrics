class AddScoreCalculatedToUserAssessment < ActiveRecord::Migration[7.1]
  def change
    add_column :user_assessments, :score_calculated, :boolean, default: false
    add_column :user_assessments, :score_calculated_at, :datetime

    reversible do |dir|
      dir.up do
        execute <<-SQL
          UPDATE user_assessments
          SET score_calculated = true, score_calculated_at = completed_at
          WHERE status = 2
        SQL
      end
    end
  end
end
