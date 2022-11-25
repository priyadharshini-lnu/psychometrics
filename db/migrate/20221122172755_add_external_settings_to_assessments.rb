class AddExternalSettingsToAssessments < ActiveRecord::Migration[6.1]
  def change
    add_column :assessments, :external_settings, :jsonb, default: {}

    ActiveRecord::Migration[6.1].execute(migrate_hogan_settings)
    ActiveRecord::Migration[6.1].execute(migrate_iiht_settings)
    ActiveRecord::Migration[6.1].execute(migrate_pearson_settings)
    ActiveRecord::Migration[6.1].execute(migrate_saville_settings)
  end

  def migrate_hogan_settings
    <<-SQL.squish
      UPDATE assessments
      SET external_settings = json_build_object(
        'assessment_id', hogans.hogan_assessment_id,
        'form_id', hogans.hogan_form_id
      )
      FROM (SELECT * FROM assessments INNER JOIN hogan_assessment_settings ON assessments.id = hogan_assessment_settings.assessment_id) AS hogans
      WHERE assessments.id = hogans.assessment_id
    SQL
  end

  def migrate_iiht_settings
    <<-SQL.squish
      UPDATE assessments
      SET external_settings = json_build_object(
        'assessment_id', iiht.iiht_assessment_id_number,
        'schedule_config', iiht.iiht_schedule_config
      )
      FROM (SELECT * FROM assessments INNER JOIN iiht_assessment_settings ON assessments.id = iiht_assessment_settings.assessment_id) AS iiht
      WHERE assessments.id = iiht.assessment_id
    SQL
  end

  def migrate_pearson_settings
    <<-SQL.squish
      UPDATE assessments
      SET external_settings = json_build_object(
        'assessment_id', pearson.pearson_assessment_id,
        'norm_id', pearson.pearson_norm_id
      )
      FROM (SELECT * FROM assessments INNER JOIN pearson_assessment_settings ON assessments.id = pearson_assessment_settings.assessment_id) AS pearson
      WHERE assessments.id = pearson.assessment_id
    SQL
  end

  def migrate_saville_settings
    <<-SQL.squish
      UPDATE assessments
      SET external_settings = json_build_object(
        'assessment_id', saville.saville_assessment_id,
        'norm_id', saville.saville_norm_id
      )
      FROM (SELECT * FROM assessments INNER JOIN saville_assessment_settings ON assessments.id = saville_assessment_settings.assessment_id) AS saville
      WHERE assessments.id = saville.assessment_id
    SQL
  end
end
