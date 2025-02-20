# frozen_string_literal: true

module UserReports::GeneratePdfConcern
  extend ActiveSupport::Concern

  private

  def export_pdf_using_local_chrome
    file_path = make_path
    args = default_report_export_options.merge(
      output: file_path
    ).to_a.map do |key, value|
      "#{key}='#{key == :url ? value : Shellwords.escape(value)}'"
    end.join(' ')

    Rails.logger.info "$(cd #{Rails.root} && npm run export_pdf -- #{args})"
    Kernel.system("$(cd #{Rails.root} && npm run export_pdf -- #{args})")
    { file_path: file_path }
  end

  def export_pdf_using_lambda(record) # rubocop:disable Metrics/AbcSize
    file_path = if options[:file_path]
                  "#{options[:file_path]}/#{report_file_name}"
                else
                  record.attachment_storage_path('pdf_file', report_file_name)
                end

    webhook_message = { record_id: record.id, record_type: record.class.name, file_name: report_file_name,
                        file_path: file_path, lang: options[:lang] }
    webhook_message[:notify_user_id] = current_user.id if options[:notify_user]
    webhook_message[:update_record] = true # options[:update_record] != false
    webhook_message[:admin_job_record_id] = options[:admin_job_record_id] if options[:admin_job_record_id]

    lambda_option = default_report_export_options.merge(
      output_file_path: file_path,
      file_name: report_file_name,
      webhook_message: webhook_message,
      async: options[:async],
      low_priority: options[:low_priority],
      meta: {
        project_id: campaign.project.id,
        campaign_id: campaign.id,
        user_id: user.id,
        record_id: record.id,
        record_type: record.class.name,
        file_attribute: 'pdf_file'
      },
      pdf_password: campaign.pdf_password
    )
    Rails.logger.info(
      log_type: 'UserReports::GeneratePdf',
      campaign_id: campaign.id,
      user_id: user.id,
      record_id: record.id,
      record_type: record.class.name,
      options: options
    )

    Lambdas::UrlToPdf.call!(lambda_option)
    { file_name: report_file_name }
  end

  def make_path
    FileUtils.mkdir_p(report_directory)
    File.join(report_directory, report_file_name)
  end
end
