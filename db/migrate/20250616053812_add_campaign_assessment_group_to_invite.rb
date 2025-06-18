# frozen_string_literal: true

class AddCampaignAssessmentGroupToInvite < ActiveRecord::Migration[7.1]
  def up
    add_reference :workshop_invites, :campaign_assessment_group, foreign_key: { on_delete: :nullify }

    # Update workshop_invites
    execute <<-SQL.squish
    UPDATE workshop_invites wi
    SET campaign_assessment_group_id = w.campaign_assessment_group_id,
        updated_at = CURRENT_TIMESTAMP
    FROM workshops w
    INNER JOIN workshop_invites_workshops wiw ON wiw.workshop_id = w.id
    WHERE wiw.workshop_invite_id = wi.id
    AND wi.campaign_assessment_group_id IS NULL;
    SQL
  end

  def down
    remove_reference :workshop_invites, :campaign_assessment_group, foreign_key: true
  end
end
