# frozen_string_literal: true

class AddThumbnailToReportsAndAssessments < ActiveRecord::Migration[5.1]
  def change
    add_column :reports, :extra, :jsonb, null: false, default: {}
    add_column :assessments, :extra, :jsonb, null: false, default: {}
    add_column :reports, :icon, :string
    add_column :assessments, :icon, :string
  end
end
