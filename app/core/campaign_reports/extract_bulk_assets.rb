# frozen_string_literal: true

module CampaignReports
  class ExtractBulkAssets < BaseCommand
    MAX_EMAILS = 200
    EXPECTED_HEADERS = %w[user_email file_name].freeze

    private_attr_reader :campaign_report, :current_user, :admin_job_record, :campaign, :errors

    def initialize(campaign_report, current_user, admin_job_record)
      @campaign_report = campaign_report
      @current_user = current_user
      @admin_job_record = admin_job_record
      @campaign = campaign_report.campaign
    end

    def call
      ensure_attachments_present!
      validate_csv_file!

      user_report_pdfs_map = build_user_report_pdfs_map

      faas_extract_and_upload(user_report_pdfs_map)

      broadcast :waiting
    end

    private

    def ensure_attachments_present!
      unless campaign_report.bulk_assets_zip.attached? && campaign_report.bulk_assets_csv.attached?
        raise StandardError, I18n.t('administration.campaign_report.bulk_assets_upload.errors.csv_and_zip_must_exist')
      end
    end

    def parsed_csv_data
      @parsed_csv_data ||= CsvFileParser.call!(campaign_report.bulk_assets_csv, headers: :first_row)
    end

    def user_emails
      @user_emails ||= parsed_csv_data['user_email'].map { |e| e.to_s.strip }
    end

    def file_names
      @file_names ||= parsed_csv_data['file_name'].map { |f| f.to_s.strip }
    end

    def validate_csv_file!
      form = ::CampaignReports::ValidateBulkAssetsCsvForm.new(
        parsed_csv_data: parsed_csv_data,
        user_reports_by_email: user_reports_by_email
      )

      unless form.valid?
        raise StandardError, form.errors.full_messages.join(', ')
      end
    end

    def user_reports_by_email
      @user_reports_by_email ||= campaign_report.user_reports.includes(:user).where(
        users: { email: user_emails.uniq }
      ).index_by { |ur| ur.user.email }
    end

    def build_user_report_pdfs_map
      user_report_pdfs_map = {}

      parsed_csv_data.each do |row|
        email = row['user_email'].to_s.strip
        file_name = row['file_name'].to_s.strip

        user_report = user_reports_by_email[email]
        raise StandardError, "UserReport not found for #{email}" unless user_report

        report_pdf = user_report.report_pdfs.find_or_create_by!(locale: user_report.effective_default_language)

        user_report_pdfs_map[file_name] = {
          user_report_id: user_report.id,
          report_pdf_id: report_pdf.id,
          email: email,
          file_name: file_name,
          output_file_path: report_pdf.attachment_storage_path(
            'pdf_file',
            "#{File.basename(file_name, File.extname(file_name))}_" \
            "#{Time.zone.now.strftime('%Y-%m-%d_%H-%M-%S')}" \
            "#{File.extname(file_name)}"
          )
        }
      end

      user_report_pdfs_map
    end

    def faas_extract_and_upload(user_report_pdfs_map)
      webhook_message = {
        campaign_report_id: campaign_report.id,
        admin_job_record_id: admin_job_record.id,
        user_report_pdfs_map: user_report_pdfs_map
      }

      faas_options = {
        s3ZipFilePath: campaign_report.bulk_assets_zip.key,
        zip_file_name: campaign_report.bulk_assets_zip.filename.to_s,
        webhook_message: webhook_message
      }

      admin_job_record.update!(status: :in_progress, total_tasks: user_emails.uniq.size)

      Faas::ExtractAndUpload.call!(faas_options)
    end
  end
end
