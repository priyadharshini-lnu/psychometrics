# frozen_string_literal: true

class CreateAssessmentGroups < ActiveRecord::Migration[5.1]
  def change
    create_table :campaign_assessment_groups do |t|
      t.references :campaign, foreign_key: { on_delete: :cascade }
      t.string :name
      t.boolean :previous_group_required
      t.boolean :previous_assessments_required
      t.integer :position

      t.timestamps
    end
  end
end
