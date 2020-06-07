# frozen_string_literal: true

class DropTableUsersAssessments < ActiveRecord::Migration[5.1]
  def change
    remove_column :media_responses, :users_assessment_id
    drop_table :users_assessments
  end
end
