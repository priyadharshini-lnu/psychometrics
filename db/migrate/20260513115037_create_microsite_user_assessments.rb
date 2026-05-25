# frozen_string_literal: true

class CreateMicrositeUserAssessments < ActiveRecord::Migration[8.0]
  def change
    create_table :microsite_user_assessments do |t| # rubocop:disable CustomRubocops/CreateTableMigrationRequiresTenantId
      t.references :user_assessment, foreign_key: true, null: false
      t.string :participant_id
      t.string :url

      t.timestamps
    end

    add_index :microsite_user_assessments, :participant_id
  end
end
