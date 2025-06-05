# frozen_string_literal: true

class AssociateAssessmentCenterItemsWithGroups < ActiveRecord::Migration[7.1]
  def up
    execute <<-SQL
    -- Update workshops to associate with their campaign's Assessment Center group
      UPDATE workshops w
      SET campaign_assessment_group_id = cag.id,
          updated_at = CURRENT_TIMESTAMP
      FROM campaign_assessment_groups cag
      WHERE w.campaign_id = cag.campaign_id
      AND cag.group_type = 1
      AND w.campaign_assessment_group_id IS NULL;

      -- Update workshop activities to associate with their campaign's Assessment Center group
      UPDATE campaign_assessments ca
      SET campaign_assessment_group_id = cag.id,
          updated_at = CURRENT_TIMESTAMP
      FROM campaign_assessment_groups cag
      WHERE ca.campaign_id = cag.campaign_id
      AND ca.workshop_activity = true
      AND cag.group_type = 1
      AND ca.campaign_assessment_group_id IS NULL;
    SQL
  end

  def down
    execute <<-SQL
    -- Remove assessment center group associations
    UPDATE workshops
    SET campaign_assessment_group_id = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE campaign_assessment_group_id IN (
      SELECT id FROM campaign_assessment_groups WHERE group_type = 1
    );

    UPDATE campaign_assessments
    SET campaign_assessment_group_id = NULL,
        updated_at = CURRENT_TIMESTAMP
    WHERE workshop_activity = true
    AND campaign_assessment_group_id IN (
      SELECT id FROM campaign_assessment_groups WHERE group_type = 1
    );
    SQL
  end
end
