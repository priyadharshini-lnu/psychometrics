# frozen_string_literal: true

class AddCampaignAssessmentGroupToCommunication < ActiveRecord::Migration[7.1]
  def up
    add_reference :communications, :campaign_assessment_group, foreign_key: { on_delete: :nullify }

    # Update communications with first campaign assessment group of campaign
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
    UPDATE communications c
    SET campaign_assessment_group_id = fag.id,
        updated_at = CURRENT_TIMESTAMP
    FROM first_assessment_groups fag
    WHERE c.campaign_id = fag.campaign_id
    AND c.campaign_assessment_group_id IS NULL;
    SQL
  end

  def down
    remove_reference :communications, :campaign_assessment_group, foreign_key: true
  end
end
