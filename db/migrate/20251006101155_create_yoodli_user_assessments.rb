# frozen_string_literal: true

class CreateYoodliUserAssessments < ActiveRecord::Migration[7.1]
  def change
    create_table :yoodli_user_assessments do |t|
      t.references :user_assessment, foreign_key: true, null: false
      t.string :email
      t.timestamps
    end
  end
end
