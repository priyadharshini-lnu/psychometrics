# frozen_string_literal: true

class AddConfidenceIntervalToMhsUserAssessment < ActiveRecord::Migration[8.0]
  def change
    add_column :mhs_user_assessments, :confidence_interval, :integer, default: 0
  end
end
