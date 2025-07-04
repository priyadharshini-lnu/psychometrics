# frozen_string_literal: true

class AddErrorDetailsToPearsonUserAssessment < ActiveRecord::Migration[7.1]
  def change
    add_column :pearson_user_assessments, :error_details, :jsonb, default: {}
  end
end
