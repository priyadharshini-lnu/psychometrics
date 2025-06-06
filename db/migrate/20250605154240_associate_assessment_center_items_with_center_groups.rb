# frozen_string_literal: true

class AssociateAssessmentCenterItemsWithCenterGroups < ActiveRecord::Migration[7.1]
  def up
    # Create Assessment Center groups
    execute <<-SQL.squish
    INSERT INTO campaign_assessment_groups (
      campaign_id, group_type, name,
      previous_group_required, previous_assessments_required,
      position,
      created_at, updated_at
    )
    SELECT DISTINCT
      w.campaign_id, 1, 'Assessment Center',
      false, false,
      COALESCE((
        SELECT MAX(position) + 1
        FROM campaign_assessment_groups cag2
        WHERE cag2.campaign_id = w.campaign_id
      ), 1),
      CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    FROM workshops w
    WHERE NOT EXISTS (
      SELECT 1 FROM campaign_assessment_groups cag
      WHERE cag.campaign_id = w.campaign_id AND cag.group_type = 1
    );
    SQL

    # Update workshops
    execute <<-SQL.squish
    UPDATE workshops w
    SET campaign_assessment_group_id = cag.id,
        updated_at = CURRENT_TIMESTAMP
    FROM campaign_assessment_groups cag
    WHERE w.campaign_id = cag.campaign_id
    AND cag.group_type = 1
    AND w.campaign_assessment_group_id IS NULL;
    SQL

    # Update campaign assessments
    execute <<-SQL.squish
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
