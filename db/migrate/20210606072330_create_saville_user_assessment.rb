# frozen_string_literal: true

class CreateSavilleUserAssessment < ActiveRecord::Migration[5.2]
  def change
    create_table :saville_user_assessments do |t|
      t.references :user_assessment, null: false, foreign_key: { on_delete: :cascade }
      t.string :request_id
      t.string :url
      t.string :norm_id
      t.timestamps null: false
    end
  end
end
