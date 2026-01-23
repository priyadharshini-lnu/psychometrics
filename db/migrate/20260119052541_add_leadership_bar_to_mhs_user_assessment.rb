# frozen_string_literal: true

class AddLeadershipBarToMhsUserAssessment < ActiveRecord::Migration[8.0]
  def change
    add_column :mhs_user_assessments, :leadership_bar, :integer, default: 0
  end
end
