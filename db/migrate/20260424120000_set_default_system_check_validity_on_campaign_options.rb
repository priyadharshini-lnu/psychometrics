# frozen_string_literal: true

class SetDefaultSystemCheckValidityOnCampaignOptions < ActiveRecord::Migration[8.0]
  def up
    change_column_default :campaign_options, :system_check_validity, 86_400
    execute <<-SQL.squish
      UPDATE campaign_options SET system_check_validity = 86400 WHERE system_check_validity IS NULL
    SQL
  end

  def down
    change_column_default :campaign_options, :system_check_validity, nil
  end
end
