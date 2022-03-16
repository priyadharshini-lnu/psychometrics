# frozen_string_literal: true

class CreateIihtUserAssessments < ActiveRecord::Migration[5.2]
  def change
    create_table :iiht_user_assessments do |t|
      t.references :user_assessment, foreign_key: true, null: false
      t.integer :number_of_attempts, default: 0, null: false
      t.string :url

      t.timestamps
    end
  end
end
