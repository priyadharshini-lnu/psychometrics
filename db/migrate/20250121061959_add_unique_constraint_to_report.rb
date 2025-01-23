# frozen_string_literal: true

class AddUniqueConstraintToReport < ActiveRecord::Migration[7.1]
  def up
    # Find and delete duplicate rows, keeping only the latest one based on created_at
    ActiveRecord::Base.connection.execute <<-SQL.squish
      WITH latest_reports AS (
        SELECT MAX(id) AS id
        FROM campaign_reports
        GROUP BY campaign_id, report_id
      )
      DELETE FROM campaign_reports
      WHERE id NOT IN (SELECT id FROM latest_reports);
    SQL

    add_index :campaign_reports, %i[campaign_id report_id], unique: true,
name: 'index_campaign_reports_on_campaign_id_and_report_id'
  end

  def down
    remove_index :campaign_reports, name: 'index_campaign_reports_on_campaign_id_and_report_id'
  end
end
