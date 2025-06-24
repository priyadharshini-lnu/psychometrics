# frozen_string_literal: true

class AddCampaignAssessmentGroupToCampaignAssessorForm < ActiveRecord::Migration[7.1]
  def up
    add_reference :campaign_assessor_assessments, :campaign_assessment_group, foreign_key: { on_delete: :nullify }

    # Update campaign_assessor_assessments with first campaign assessment group of campaign
    execute <<-SQL.squish
    WITH first_assessment_groups AS (
      SELECT DISTINCT ON (campaign_id)
        id,
        campaign_id
      FROM campaign_assessment_groups
      WHERE campaign_id IS NOT NULL
        AND group_type = 1
      ORDER BY campaign_id, position ASC, created_at ASC
    )
    UPDATE campaign_assessor_assessments caa
    SET campaign_assessment_group_id = fag.id,
        updated_at = CURRENT_TIMESTAMP
    FROM first_assessment_groups fag
    WHERE caa.campaign_id = fag.campaign_id
    AND caa.campaign_assessment_group_id IS NULL;
    SQL
  end

  def down
    remove_reference :campaign_assessor_assessments, :campaign_assessment_group, foreign_key: true
  end
end
