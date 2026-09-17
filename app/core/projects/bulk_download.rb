# frozen_string_literal: true

module Projects
  class BulkDownload < BaseCommand
    include BulkDownloadHelpers

    private_attr_reader :current_user, :job_record, :bulk_report, :project_name

    def initialize(current_user:, job_record:, project_name: 'project')
      @current_user = current_user
      @job_record   = job_record
      @project_name = project_name
    end

    def call
      campaign_groups = collect_user_reports

      create_bulk_report_job!

      if campaign_groups.empty? || campaign_groups.all? { |g| g[:file_entries].empty? }
        return broadcast :ok, { error_messages: [I18n.t('administration.bulk_reports.reports_unavailable')] }
      end

      if Settings.features.zip_s3_files_faas
        bulk_download_with_faas(campaign_groups)
        broadcast :waiting
      else
        BulkDownloadWithoutFaas.new(bulk_report: bulk_report, job_record: job_record).call(campaign_groups)
        broadcast :ok, bulk_report
      end
    end

    private

    def create_bulk_report_job!
      @bulk_report = ::BulkReport.create!(user: current_user)
      bulk_report_job = ::BulkReportJob.create!(
        project_id:       job_record.data['project_id'],
        admin_job_record: job_record,
        bulk_report:      bulk_report,
        created_by:       current_user,
        start_date:       job_record.data['start_date'],
        end_date:         job_record.data['end_date']
      )

      job_record.update!(data: job_record.data.merge(
        'bulk_report_id' => bulk_report.id,
        'bulk_report_job_id' => bulk_report_job.id
      ))
    end

    def collect_user_reports
      campaign_groups = []

      campaigns.each do |campaign|
        file_entries = file_entries_for_campaign(campaign)
        next if file_entries.empty?

        campaign_groups << {
          campaign_name: campaign.name,
          file_entries: file_entries
        }
      end

      campaign_groups
    end

    def file_entries_for_campaign(campaign)
      user_reports_for_campaign(campaign).each_with_object([]) do |user_report, file_entries|
        effective_locales(user_report).each do |locale|
          pdf_path = user_report.pdf_path(locale: locale)
          next unless pdf_path

          file_entries << file_entry_for(user_report, locale, pdf_path)
        end
      end
    end

    def user_reports_for_campaign(campaign)
      user_report_ids = user_report_ids_for_campaign(campaign)
      return [] if user_report_ids.empty?

      UserReport.
        preload_pdf_attachments.
        includes(:user, :report, :campaign).
        where(id: user_report_ids).
        to_a
    end

    def user_report_ids_for_campaign(campaign)
      campaign_reports = campaign.campaign_reports.where(report_id: selected_report_ids)
      return [] if campaign_reports.blank?

      ::Reports::BulkDownloadsQuery.new(campaign_reports, report_download_params).query.pluck(:id).uniq
    end

    def campaigns
      @campaigns ||= Campaign.
                     where(id: job_record.data['campaign_ids']).
                     where(type: Campaign.types[:common]).
                     includes(campaign_reports: :report)
    end

    def selected_report_ids
      @selected_report_ids ||= (job_record.data['selected_reports'] || {}).keys.map(&:to_i)
    end

    def effective_locales(user_report)
      job_record.data.dig('selected_reports', user_report.report_id.to_s) ||
        [user_report.effective_default_language]
    end

    def report_download_params
      {
        start_date: job_record.data['start_date'],
        end_date: job_record.data['end_date'],
        include_inactive_users: job_record.data['include_inactive_users'] || false,
        selected_reports: job_record.data['selected_reports']
      }
    end

    def file_entry_for(user_report, locale, pdf_path)
      {
        s3FilePath: pdf_path,
        zipOutputFilePath: zip_output_path(user_report, locale),
        _user_report: user_report,
        _locale: locale
      }
    end

    def zip_output_path(user_report, locale)
      [
        safe_folder_name(user_report.campaign.name),
        user_report.user.email,
        "#{user_report.report.name.parameterize(preserve_case: true)}-lan-#{locale}.pdf"
      ].join('/')
    end

    def bulk_download_with_faas(campaign_groups)
      batches = BulkDownloadBatcher.new(campaign_groups).batch

      job_record.update!(
        total_tasks: batches.length,
        data:        job_record.data.merge('bulk_report_id' => bulk_report.id)
      )

      base_name = "#{safe_folder_name(project_name)}-bulk-report-#{Time.zone.today.strftime('%F')}"

      batches.each_with_index do |batch_groups, index|
        batch_suffix = batches.length > 1 ? "-part-#{index + 1}" : ''
        file_name    = "#{base_name}#{batch_suffix}"

        file_details = batch_groups.flat_map do |group|
          group[:file_entries].map do |entry|
            {
              s3FilePath: entry[:s3FilePath],
              zipOutputFilePath: "#{file_name}/#{entry[:zipOutputFilePath]}"
            }
          end
        end

        webhook_message = {
          bulk_report_id: bulk_report.id,
          file_name: file_name,
          admin_job_record_id: job_record.id
        }

        Faas::ZipS3Files.call!(
          file_details:    file_details,
          zip_file_key:    bulk_report.attachment_storage_path('files', "#{file_name}.zip"),
          webhook_message: webhook_message
        )
      end
    end
  end
end
