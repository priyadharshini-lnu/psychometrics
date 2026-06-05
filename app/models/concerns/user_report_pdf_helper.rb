# frozen_string_literal: true

module UserReportPdfHelper
  extend ActiveSupport::Concern
  include Rails.application.routes.url_helpers

  included do
    scope :with_pdf_attachments, -> { joins(user_report_pdfs: :pdf_file_attachment) }
    scope :preload_pdf_attachments, -> { includes(user_report_pdfs: { pdf_file_attachment: :blob }) }
  end

  PDF_CONTENT_TYPE = 'application/pdf'

  def attach_pdf!(data, filename = nil, locale: nil)
    user_report_pdf = find_or_create_user_report_pdf(locale: locale)

    attachment_params = build_attachment_params(data, filename)
    return false unless attachment_params

    user_report_pdf.pdf_file.attach(attachment_params)
    finalize_pdf_attachment(user_report_pdf, locale)
  end

  def pdf_exists?(locale: nil)
    locale ||= effective_default_language
    user_report_pdf(locale: locale)&.pdf_file&.attached?
  end

  def remove_report_pdf!(locale: nil)
    remove_pdf_async(locale: locale)
    remove_ai_translations
    self.status = :not_prepared
    if !threesixty? && has_approval_workflow?
      self.approval_status = :not_ready
    end
    save!
  end

  def remove_ai_translations
    ai_translation&.destroy
  end

  def remove_all_report_pdfs!
    remove_all_pdfs_async
    update!(status: :not_prepared)
  end

  def remove_all_pdfs_async
    user_report_pdfs.each do |pdf|
      pdf.pdf_file.purge_later if pdf.pdf_file.attached?
    end
  end

  def remove_pdf_and_update_status!
    return unless prepared?

    update!(status: :not_prepared, approval_status: :not_ready)
    remove_pdf_async
  end

  def remove_pdf_async(locale: nil)
    user_report_pdf(locale: locale)&.pdf_file&.purge_later
  end

  def pdf_download_url(locale: nil, only_path: true)
    return unless pdf_exists?(locale: locale)

    Rails.application.routes.url_helpers.pdf_download_link_user_report_download_url(
      id,
      locale: locale,
      host: Settings.domain,
      port: Settings.port,
      protocol: Settings.protocol,
      only_path: only_path
    )
  end

  def report_name_for_download(locale: nil)
    report_name = Utility::String.remove_non_ascii_chars(report.name).strip.presence || 'report'
    "#{user.decorate.full_name}-#{report_name}-#{user.id}_lan_#{locale}.pdf"
  end

  def find_or_create_user_report_pdf(locale: nil)
    locale ||= effective_default_language

    user_report_pdfs.find_or_create_by(locale: locale)
  end

  def user_report_pdf(locale: nil)
    locale ||= effective_default_language
    @user_report_pdf = user_report_pdfs.find_by(locale: locale)
  end

  def last_pdf_generated_at(locale: nil)
    locale ||= effective_default_language

    user_report_pdf(locale: locale)&.last_generated_at || updated_at
  end

  def pdf_path(locale: nil)
    user_report_pdf(locale: locale)&.pdf_file&.key
  end

  def pdf_url(locale: nil, expires_in: 10.minutes)
    user_report_pdf(locale: locale)&.pdf_file&.url(expires_in: expires_in)
  end

  def active_user_idp_plan_for_skill_gap_analysis
    UserIdpPlan.joins(:idp_template).
      active.
      where(
        user_id: user_id,
        campaign_id: campaign_id,
        idp_templates: { report_id: report_id }
      ).
      where.not(idp_templates: { skill_gap_report_analysis_ai_assistant_id: nil }).
      first
  end

  private

  def build_attachment_params(data, filename)
    case data
      when String
        handle_string_data(data, filename)
      when File, ActionDispatch::Http::UploadedFile
        handle_file_data(data, filename)
      when StringIO
        handle_stringio_data(data, filename)
    end
  end

  def handle_string_data(data, filename)
    if data.start_with?('http://', 'https://')
      handle_url_data(data, filename)
    else
      handle_base64_data(data, filename)
    end
  end

  def handle_url_data(data, filename)
    url = URI.parse(data)
    file = URI(data).open

    {
      io: file,
      filename: filename || File.basename(url.path),
      content_type: PDF_CONTENT_TYPE
    }
  end

  def handle_base64_data(data, filename)
    data_to_attach = ActiveStorageSupport::Base64Attach.attachment_from_data({
      data: "data:application/pdf;base64,[#{data}]"
    })
    data_to_attach[:filename] = filename if filename
    data_to_attach
  end

  def handle_file_data(data, filename)
    {
      io: data,
      filename: filename || File.basename(data),
      content_type: PDF_CONTENT_TYPE
    }
  end

  def handle_stringio_data(data, filename)
    {
      io: data,
      filename: filename || 'report.pdf',
      content_type: PDF_CONTENT_TYPE
    }
  end

  def finalize_pdf_attachment(user_report_pdf, locale)
    user_report_pdf.set_generated_timestamps
    user_report_pdf.save!
    self.status = :prepared
    save!

    publish_webhook_if_ready(user_report_pdf, locale)
    schedule_skill_gap_report_analysis
  end

  def schedule_skill_gap_report_analysis
    return if active_user_idp_plan_for_skill_gap_analysis.blank?

    Idp::PrecomputeSkillGapReportAnalysisJob.perform_later(id)
  end

  def publish_webhook_if_ready(user_report_pdf, locale)
    return unless user_report_pdf.pdf_file.attached? && user_report_pdf.persisted?

    UserReports::Webhook.new(UserReport.find(user_report_pdf.user_report_id), locale).publish_report_available
  end
end
