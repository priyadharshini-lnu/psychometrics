# frozen_string_literal: true

class FixCampaignOptionsTenantId < ActiveRecord::Migration[8.0]
  def up
    execute <<~SQL.squish
      UPDATE campaign_options
      SET tenant_id = campaigns.tenant_id
      FROM campaigns
      WHERE campaign_options.campaign_id = campaigns.id
        AND campaign_options.tenant_id IS NULL
        AND campaigns.tenant_id IS NOT NULL
    SQL
  end

  def down
    # Intentionally left empty — we do not know which records were originally nil
  end
end
