# frozen_string_literal: true

class AddCreatedByAndUpdatedByToAssessment < ActiveRecord::Migration[5.2]
  def change
    add_reference :assessments, :created_by, foreign_key: { on_delete: :nullify, to_table: :users }
    add_reference :assessments, :updated_by, foreign_key: { on_delete: :nullify, to_table: :users }
  end
end
