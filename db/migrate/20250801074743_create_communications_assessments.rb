# frozen_string_literal: true

class CreateCommunicationsAssessments < ActiveRecord::Migration[7.1]
  def change
    create_table :communications_assessments do |t|
      t.references :communication, null: false, foreign_key: true
      t.references :assessment, null: false, foreign_key: true

      t.timestamps
    end

    add_index :communications_assessments, %i[communication_id assessment_id], unique: true
  end
end
