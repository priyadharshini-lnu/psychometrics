# frozen_string_literal: true

class AddCandidateIdToSavilleUserAssessments < ActiveRecord::Migration[7.1]
  def up
    add_column :saville_user_assessments, :candidate_id, :bigint

    execute <<-SQL.squish
      UPDATE saville_user_assessments
      SET candidate_id = user_assessments.subject_id
      FROM user_assessments
      WHERE saville_user_assessments.user_assessment_id = user_assessments.id;
    SQL
  end

  def down
    remove_column :saville_user_assessments, :candidate_id
  end
end
