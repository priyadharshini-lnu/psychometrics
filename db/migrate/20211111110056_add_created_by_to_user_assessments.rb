# frozen_string_literal: true

class AddCreatedByToUserAssessments < ActiveRecord::Migration[5.2]
  def change
    add_column :user_assessments, :created_by_id, :integer
  end
end
