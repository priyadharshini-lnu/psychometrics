# frozen_string_literal: true

class CreateSimulationUserAssessments < ActiveRecord::Migration[7.1]
  def change
    create_table :simulation_user_assessments do |t|
      t.references :user_assessment, null: false, foreign_key: { on_delete: :cascade }
      t.string :participant_id

      t.timestamps
    end
  end
end
