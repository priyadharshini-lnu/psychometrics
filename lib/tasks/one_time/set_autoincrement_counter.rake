# frozen_string_literal: true

namespace :one_time do
  task :set_autoincrement_counter, %i[number] => %i[environment] do |_, args|
    tables_for_id_change = %w[
      agiles
      assessments
      blocks
      comments
      dimensions
      factors
      factors_aliases
      factors_norms
      factors_scoring
      factors_sub_factors
      hogan_assessment_settings
      hogan_report_settings
      innovation_styles
      innovation_styles_factors
      libraries
      norms
      occupations
      occupations_factors
      question_recoding
      questions
      reports
      reports_filters
      reports_modules
      reports_pages
      saville_assessment_settings
      saville_factors
      saville_report_settings
      translations
    ]

    tables_for_id_change.each do |table|
      ActiveRecord::Migration[5.1].change_column table, :id, :bigint
      ActiveRecord::Migration[5.1].execute "SELECT setval('#{table}_id_seq', #{args[:number].to_i})"
    end

    columns_to_change_to_bigint = {
      agiles: %i[assessment_id],
      assessments: %i[dimension_id],
      blocks: %i[assessment_id template_id],
      campaign_assessments: %i[assessment_id norm_id assessor_form_id],
      campaign_reports: %i[report_id],
      campaign_templates: %i[assessment_id report_id],
      comments: %i[commentable_id],
      communications: %i[assessment_id],
      factors: %i[dimension_id parent_id],
      factors_aliases: %i[factor_id report_id],
      factors_norms: %i[factor_id norm_id],
      factors_scoring: %i[factor_id assessment_id question_id],
      factors_sub_factors: %i[factor_id sub_factor_id],
      highlights: %i[assessment_id resource_id],
      hogan_assessment_settings: %i[assessment_id],
      hogan_report_settings: %i[report_id],
      innovation_styles: %i[dimension_id],
      innovation_styles_factors: %i[factor_id innovation_style_id],
      media_responses: %i[question_id],
      norms: %i[dimension_id],
      occupations: %i[dimension_id],
      occupations_factors: %i[occupation_id factor_id],
      question_recoding: %i[assessment_id question_id],
      questions: %i[block_id assessment_id template_id],
      report_families_reports: %i[report_id],
      reports: %i[assessment_id],
      reports_accesses: %i[report_id],
      reports_filters: %i[report_id assessment_id],
      reports_modules: %i[assessment_id page_id],
      reports_pages: %i[report_id],
      saville_assessment_settings: %i[assessment_id],
      saville_report_settings: %i[report_id],
      threesixty_campaigns: %i[assessment_id report_id],
      translations: %i[translateable_id resource_id],
      user_assessments: %i[assessment_id norm_id],
      user_reports: %i[report_id]
    }

    columns_to_change_to_bigint.each do |table, columns|
      columns.each do |column|
        ActiveRecord::Migration[5.1].change_column table, column, :bigint
      end
    end
  end
end
