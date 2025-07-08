# frozen_string_literal: true

class AddExternalUserIdToSkillvueUsersAssessment < ActiveRecord::Migration[7.1]
  def change
    add_column :skillvue_user_assessments, :external_user_id, :string, null: true
  end
end
