# frozen_string_literal: true

class CreatePearsonUserAssessment < ActiveRecord::Migration[5.2]
  def change
    create_table :pearson_user_assessments do |t|
      t.references :user_assessment, null: false, foreign_key: { on_delete: :cascade }
      t.string :schedule_id
      t.string :url
    end
  end
end
