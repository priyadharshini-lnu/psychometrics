# frozen_string_literal: true

namespace :one_time do
  desc 'Remove Mindmill related data'
  task remove_mindmill_related_data: :environment do
    dry_run = ENV.fetch('DRY_RUN', 'true') == 'true'
    puts 'DRY RUN - no changes will be made' if dry_run
    conn = ActiveRecord::Base.connection
    assigns_table_exists = conn.data_source_exists?('assigns')
    assigns_reports_table_exists = conn.data_source_exists?('assigns_reports')

    reports = Report.where(provider: :mindmill).includes(:user_reports, :campaign_reports)

    if reports.exists?
      puts "Found #{reports.count} Mindmill reports"
      reports.find_each do |report|
        ActiveRecord::Base.transaction do
          log_counts(report, assigns_table_exists, assigns_reports_table_exists)
          next if dry_run

          puts "Destroying report ID: #{report.id}"
          puts 'Destroying associated records...'
          report.user_reports.destroy_all
          report.campaign_reports.destroy_all

          if assigns_reports_table_exists
            puts 'Destroying assigns_reports records...'
            conn.execute("DELETE FROM assigns_reports WHERE report_id = #{report.id}")
          end

          puts 'Destroying report...'
          Report.without_auditing { report.destroy! }
        rescue StandardError => e
          puts "Error deleting report #{report.id}: #{e.message}"
          raise ActiveRecord::Rollback
        end
      end
    else
      puts 'No Mindmill reports found.'
    end

    assessments = Assessment.mindmill.includes(
      :users_results, :user_assessments, :campaign_assessments,
      :assessor_campaign_assessments, :assessments_reports,
      :assessments_clients, :campaign_factors
    )

    if assessments.exists?
      puts "Found #{assessments.count} Mindmill assessments"

      assessments.find_each do |assessment|
        ActiveRecord::Base.transaction do
          log_counts(assessment, assigns_table_exists, assigns_reports_table_exists)
          next if dry_run

          puts "Destroying assessment ID: #{assessment.id}"

          puts 'Destroying associated records...'
          assessment.users_results.destroy_all
          assessment.user_assessments.destroy_all
          assessment.campaign_assessments.destroy_all
          assessment.assessor_campaign_assessments.destroy_all
          assessment.assessments_reports.destroy_all
          assessment.assessments_clients.destroy_all
          assessment.campaign_factors.destroy_all

          if assigns_table_exists
            puts 'Destroying assigns records...'
            conn.execute("DELETE FROM assigns WHERE assessment_id = #{assessment.id}")
          end

          puts 'Destroying assessment...'
          Assessment.without_auditing { assessment.destroy! }
        rescue StandardError => e
          puts "Error deleting assessment #{assessment.id}: #{e.message}"
          raise ActiveRecord::Rollback
        end
      end
    else
      puts 'No Mindmill assessments found.'
    end

    puts 'Cleanup process completed!'
  end

  private

  def log_counts(record, assigns_table_exists = false, assigns_reports_table_exists = false)
    type = record.is_a?(Assessment) ? 'Assessment' : 'Report'
    puts "################# #{type} ID: #{record.id} #################"

    if record.is_a?(Assessment)
      puts "users_results: #{record.users_results.count}"
      puts "user_assessments: #{record.user_assessments.count}"
      puts "campaign_assessments: #{record.campaign_assessments.count}"
      puts "assessor_campaign_assessments: #{record.assessor_campaign_assessments.count}"
      puts "assessments_reports: #{record.assessments_reports.count}"
      puts "assessments_clients: #{record.assessments_clients.count}"
      puts "campaign_factors: #{record.campaign_factors.count}"
      puts "idp_template_skills: #{record.idp_template_skills.count}"
      if assigns_table_exists
        assigns_count = ActiveRecord::Base.connection.select_value(
          "SELECT COUNT(*) FROM assigns WHERE assessment_id = #{record.id}"
        )
        puts "assigns: #{assigns_count}"
      end
    else
      puts "user_reports: #{record.user_reports.count}"
      puts "campaign_reports: #{record.campaign_reports.count}"
      if assigns_reports_table_exists
        assigns_reports_count = ActiveRecord::Base.connection.select_value(
          "SELECT COUNT(*) FROM assigns_reports WHERE report_id = #{record.id}"
        )
        puts "assigns_reports: #{assigns_reports_count}"
      end
    end
  end
end
