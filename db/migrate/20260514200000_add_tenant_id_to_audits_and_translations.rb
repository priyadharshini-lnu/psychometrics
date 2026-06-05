# frozen_string_literal: true

class AddTenantIdToAuditsAndTranslations < ActiveRecord::Migration[8.0]
  TABLES = %i[
    audits
    assessment_consent_setting_translations
    assessment_translations
    campaign_option_translations
    client_translations
    communication_translations
    development_action_translations
    factor_translations
    idp_template_translations
    job_role_translations
    privacy_setting_translations
    proficiency_level_translations
    reflection_question_translations
    skill_translations
    threesixty_email_template_translations
    threesixty_instruction_template_translations
    workshop_invite_translations
  ].freeze

  # rubocop:disable CustomRubocops/AvoidActiveRecordInMigrations
  def up
    TABLES.each do |table|
      add_column table, :tenant_id, :bigint unless column_exists?(table, :tenant_id)
    end
  end

  def down
    TABLES.each do |table|
      remove_column table, :tenant_id if column_exists?(table, :tenant_id)
    end
  end
  # rubocop:enable CustomRubocops/AvoidActiveRecordInMigrations
end
