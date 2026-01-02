# frozen_string_literal: true

class MigrateTimezones < ActiveRecord::Migration[8.0]
  TABLE_FIELD_MAP = {
    user_profiles: :timezone,
    users: :timezone,
    communications: :delivery_timezone,
    report_approval_settings: :digest_timezone,
    user_availability_dates: :timezone,
    workshops: :timezone
  }.freeze

  OLD = 'Asia/Calcutta'
  NEW = 'Asia/Kolkata'

  def up
    TABLE_FIELD_MAP.each do |table, column|
      execute <<-SQL.squish
        UPDATE #{table}
        SET #{column} = '#{NEW}'
        WHERE #{column} = '#{OLD}'
      SQL
    end
  end

  def down
    TABLE_FIELD_MAP.each do |table, column|
      execute <<-SQL.squish
        UPDATE #{table}
        SET #{column} = '#{OLD}'
        WHERE #{column} = '#{NEW}'
      SQL
    end
  end
end
