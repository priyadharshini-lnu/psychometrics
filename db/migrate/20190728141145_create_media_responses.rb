# frozen_string_literal: true

class CreateMediaResponses < ActiveRecord::Migration[5.1]
  def change
    create_table :media_responses do |t|
      t.string :asset
      t.references :users_assessment, foreign_key: { on_delete: :cascade }
      t.references :question, foreign_key: true
      t.index %i[users_assessment_id question_id], unique: true,
              name: 'media_responses_users_assessment_question_id_index'
      t.timestamps
    end
  end
end
