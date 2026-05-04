# frozen_string_literal: true

class MigrateAIScoringApprovalSettingTimezones < ActiveRecord::Migration[8.0]
  OLD = 'Asia/Calcutta'
  NEW = 'Asia/Kolkata'

  def up
    execute <<-SQL.squish
      UPDATE ai_scoring_approval_settings
      SET digest_timezone = '#{NEW}'
      WHERE digest_timezone = '#{OLD}'
    SQL
  end

  def down
    execute <<-SQL.squish
      UPDATE ai_scoring_approval_settings
      SET digest_timezone = '#{OLD}'
      WHERE digest_timezone = '#{NEW}'
    SQL
  end
end
