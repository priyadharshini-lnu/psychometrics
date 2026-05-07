# frozen_string_literal: true

class MigrateMhsEqi2V2r2Guids < ActiveRecord::Migration[8.0]
  OLD_ASSESSMENT_ID = '9039cce2-6567-4bc5-8655-8792ba9ab936'
  NEW_ASSESSMENT_ID = 'ad8f2591-4d23-4892-808e-5ea4e68feba7'

  REPORT_ID_MAP = {
    'bc791135-086f-4d67-a8c1-cea00c003ded' => 'bf2375c6-6720-4653-a544-3e7fa8cd8674', # Workplace Client
    '088d8d3e-46c1-4751-b92f-8f6984f6ea49' => 'aae7a2bf-3c64-4dee-91f5-5723a96bfca8', # Workplace Coach
    'f2e0ff10-629d-4ede-af46-9911991927c4' => 'ff7c7544-9f1e-4fb3-833c-b16ca4a00bc4', # Leadership Client
    '3f584d17-f016-4ca7-a0fd-a63534f6c45b' => 'de8854ae-d69b-49ad-876d-b9c4331d5f6b'  # Leadership Coach
  }.freeze

  OLD_NORM_REGION = 0 # Global
  NEW_NORM_REGION = 6 # UK/Ireland

  OLD_EVALUATOR_ID = '7aace635-1801-4e9b-896b-faa3446036b5'
  NEW_EVALUATOR_ID = 'c8b0d50d-73c3-48ab-985f-abd80945ba71'

  OLD_DATA_GATHERER_ID = '4884446c-5a3f-481a-ba8e-a97400f9d670'
  NEW_DATA_GATHERER_ID = '71761120-449d-49bc-b5dd-15df53bf7047'

  SCORED_DATASET_REPORT_IDS = %w[
    c419ab41-a607-4fcf-a8a9-a1a27496adcc
    c419ab41-e607-4fcf-a8a9-a1227496adcc
  ].freeze

  def up
    migrate_assessment_external_settings
    migrate_report_external_settings
    migrate_norm_regions
    migrate_evaluator_id
    migrate_data_gatherer_id
    remove_scored_dataset_reports
  end

  def down
    revert_assessment_external_settings
    revert_report_external_settings
    revert_norm_regions
    revert_evaluator_id
    revert_data_gatherer_id
  end

  private

  def migrate_assessment_external_settings
    execute <<~SQL.squish
      UPDATE assessments
      SET external_settings = jsonb_set(external_settings, '{assessment_id}', '"#{NEW_ASSESSMENT_ID}"')
      WHERE external_settings->>'assessment_id' = '#{OLD_ASSESSMENT_ID}'
    SQL
  end

  def revert_assessment_external_settings
    execute <<~SQL.squish
      UPDATE assessments
      SET external_settings = jsonb_set(external_settings, '{assessment_id}', '"#{OLD_ASSESSMENT_ID}"')
      WHERE external_settings->>'assessment_id' = '#{NEW_ASSESSMENT_ID}'
    SQL
  end

  def migrate_report_external_settings
    REPORT_ID_MAP.each do |old_id, new_id|
      execute <<~SQL.squish
        UPDATE reports
        SET external_settings = jsonb_set(external_settings, '{report_id}', '"#{new_id}"')
        WHERE external_settings->>'report_id' = '#{old_id}'
      SQL
    end
  end

  def revert_report_external_settings
    REPORT_ID_MAP.each do |old_id, new_id|
      execute <<~SQL.squish
        UPDATE reports
        SET external_settings = jsonb_set(external_settings, '{report_id}', '"#{old_id}"')
        WHERE external_settings->>'report_id' = '#{new_id}'
      SQL
    end
  end

  def migrate_norm_regions
    execute <<~SQL.squish
      UPDATE mhs_user_assessments SET norm_region = #{NEW_NORM_REGION} WHERE norm_region = #{OLD_NORM_REGION}
    SQL
  end

  def revert_norm_regions
    execute <<~SQL.squish
      UPDATE mhs_user_assessments SET norm_region = #{OLD_NORM_REGION} WHERE norm_region = #{NEW_NORM_REGION}
    SQL
  end

  def remove_scored_dataset_reports
    ids = SCORED_DATASET_REPORT_IDS.map { |id| "'#{id}'" }.join(', ')
    execute <<~SQL.squish
      DELETE FROM reports WHERE external_settings->>'report_id' IN (#{ids})
    SQL
  end

  def migrate_evaluator_id
    execute <<~SQL.squish
      UPDATE users_results
      SET external_results = jsonb_set(external_results, '{evaluator_id}', '"#{NEW_EVALUATOR_ID}"')
      WHERE external_results->>'evaluator_id' = '#{OLD_EVALUATOR_ID}'
    SQL
  end

  def revert_evaluator_id
    execute <<~SQL.squish
      UPDATE users_results
      SET external_results = jsonb_set(external_results, '{evaluator_id}', '"#{OLD_EVALUATOR_ID}"')
      WHERE external_results->>'evaluator_id' = '#{NEW_EVALUATOR_ID}'
    SQL
  end

  def migrate_data_gatherer_id
    execute <<~SQL.squish
      UPDATE mhs_user_assessments SET data_gatherer_id = '#{NEW_DATA_GATHERER_ID}'
      WHERE data_gatherer_id = '#{OLD_DATA_GATHERER_ID}'
    SQL
  end

  def revert_data_gatherer_id
    execute <<~SQL.squish
      UPDATE mhs_user_assessments SET data_gatherer_id = '#{OLD_DATA_GATHERER_ID}'
      WHERE data_gatherer_id = '#{NEW_DATA_GATHERER_ID}'
    SQL
  end
end
