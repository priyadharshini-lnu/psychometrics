# frozen_string_literal: true

class CreateMhsUserAssessments < ActiveRecord::Migration[8.0]
  def change
    create_table :mhs_user_assessments do |t|
      t.references :user_assessment, foreign_key: true, null: false
      t.string :url
      t.string :email
      t.string :session_id

      t.timestamps
    end
  end
end
