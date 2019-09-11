# frozen_string_literal: true

class CreateAssessmentsClientsJoinTable < ActiveRecord::Migration[5.1]
  def change
    create_table :assessments_clients do |t|
      t.references :client, foreign_key: { on_delete: :cascade }, index: false
      t.references :assessment, foreign_key: { on_delete: :cascade }, index: false
      t.integer :position
      t.timestamps

      t.index %i[client_id assessment_id], unique: true
    end
  end
end
