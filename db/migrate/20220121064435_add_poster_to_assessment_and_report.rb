# frozen_string_literal: true

class AddPosterToAssessmentAndReport < ActiveRecord::Migration[5.2]
  def change
    add_column :assessments, :poster, :string
    add_column :reports, :poster, :string
  end
end
