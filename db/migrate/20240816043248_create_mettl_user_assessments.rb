# frozen_string_literal: true

class CreateMettlUserAssessments < ActiveRecord::Migration[7.1]
  def change
    create_table :mettl_user_assessments do |t|
      t.references :user_assessment, foreign_key: true, null: false
      t.string :url
      t.string :email
      t.integer :schedule_id

      t.timestamps
    end
  end
end
