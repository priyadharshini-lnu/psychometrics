# frozen_string_literal: true

class AddAssessmentIdToFilters < ActiveRecord::Migration[5.1]
  def change
    add_column :reports_filters, :assessment_id, :integer
  end
end
