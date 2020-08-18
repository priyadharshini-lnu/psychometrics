# frozen_string_literal: true

class AddNormToCampaignsAssessment < ActiveRecord::Migration[5.1]
  def change
    add_reference :campaigns_assessments, :norm, foreign_key: { on_delete: :restrict }
  end
end
