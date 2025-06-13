# frozen_string_literal: true

class AddPreworkToUserAssessments < ActiveRecord::Migration[7.1]
  def change
    add_column :user_assessments, :prework, :boolean, default: false, null: false
    add_index :user_assessments, :prework

    reversible do |dir|
      dir.up do
        execute <<~SQL.squish
          UPDATE user_assessments
          SET prework = COALESCE(campaign_assessments.prework, false)
          FROM campaign_assessments
          WHERE campaign_assessments.assessment_id = user_assessments.assessment_id
            AND campaign_assessments.campaign_id = user_assessments.campaign_id
        SQL
      end
    end
  end
end
