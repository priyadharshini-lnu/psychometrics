class AddExternalSettingsToReports < ActiveRecord::Migration[6.1]
  def change
    add_column :reports, :external_settings, :jsonb, default: {}

    ActiveRecord::Migration[6.1].execute(migrate_hogan_report_settings)
    ActiveRecord::Migration[6.1].execute(migrate_saville_report_settings)
  end

  def migrate_hogan_report_settings
    <<-SQL.squish
      UPDATE reports
      SET external_settings = json_build_object(
        'report_id', hogans.hogan_report_id,
        'norm', hogans.hogan_norm_id,
        'language_id', hogans.hogan_language_id,
        'suitability_id', hogans.hogan_suitability_id
      )
      FROM (SELECT * FROM reports INNER JOIN hogan_report_settings ON reports.id = hogan_report_settings.report_id) AS hogans
      WHERE reports.id = hogans.report_id
    SQL
  end

  def migrate_saville_report_settings
    <<-SQL.squish
      UPDATE reports
      SET external_settings = json_build_object(
        'report_id', savilles.saville_report_id
      )
      FROM (SELECT * FROM reports INNER JOIN saville_report_settings ON reports.id = saville_report_settings.report_id) AS savilles
      WHERE reports.id = savilles.report_id
    SQL
  end
end
