# frozen_string_literal: true

class AddProjectIdToAssessments < ActiveRecord::Migration[5.2]
  def change
    add_reference :assessments, :project, foreign_key: { on_delete: :cascade, to_table: :clients }
  end
end
