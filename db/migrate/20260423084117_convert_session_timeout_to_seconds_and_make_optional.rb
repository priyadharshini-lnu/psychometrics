# frozen_string_literal: true

class ConvertSessionTimeoutToSecondsAndMakeOptional < ActiveRecord::Migration[8.0]
  def up
    change_table :client_sso_settings, bulk: true do |t|
      t.change_default :session_timeout, from: 120, to: nil
      t.change_null :session_timeout, true
    end
    execute 'UPDATE client_sso_settings SET session_timeout = session_timeout * 60 WHERE session_timeout IS NOT NULL'
  end

  def down
    execute <<-SQL.squish
      UPDATE client_sso_settings
      SET session_timeout = ROUND(session_timeout::numeric / 60)
      WHERE session_timeout IS NOT NULL
    SQL
    change_table :client_sso_settings, bulk: true do |t|
      t.change_null :session_timeout, false, 120
      t.change_default :session_timeout, from: nil, to: 120
    end
  end
end
