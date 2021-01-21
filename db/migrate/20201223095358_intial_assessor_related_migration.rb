# frozen_string_literal: true

class IntialAssessorRelatedMigration < ActiveRecord::Migration[5.2]
  def change
    create_table :assessors do |t|
      t.belongs_to :campaign, foreign_key: { on_delete: :cascade }
      t.belongs_to :user, foreign_key: { on_delete: :cascade }

      t.timestamps
    end

    add_column :campaign_reports, :assessor_access, :boolean, default: false
    add_reference :campaign_assessments, :assessor_form, foreign_key: { to_table: :assessments, on_delete: :restrict }
  end
end
