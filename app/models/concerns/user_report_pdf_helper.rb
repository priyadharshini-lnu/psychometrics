# frozen_string_literal: true

module UserReportPdfHelper
  extend ActiveSupport::Concern

  included do
    scope :with_pdf_attachments, -> { joins(user_report_pdfs: :pdf_file_attachment) }
    scope :preload_pdf_attachments, -> { includes(user_report_pdfs: { pdf_file_attachment: :blob }) }
  end

  PDF_CONTENT_TYPE = 'application/pdf'

  def attach_pdf!(data, filename = nil, locale: nil)
    user_report_pdf = find_or_create_user_report_pdf(locale: locale)

    case data
      when String
        if data.start_with?('http://', 'https://')
          url = URI.parse(data)
          file = URI(data).open

          user_report_pdf.pdf_file.attach(
            io: file,
            filename: filename || File.basename(url.path),
            content_type: PDF_CONTENT_TYPE
          )
        else
          data_to_attach = ActiveStorageSupport::Base64Attach.attachment_from_data({
            data: "data:application/pdf;base64,[#{data}]"
          })
          data_to_attach[:filename] = filename if filename
          user_report_pdf.pdf_file.attach(data_to_attach)
        end
      when File, ActionDispatch::Http::UploadedFile
        user_report_pdf.pdf_file.attach(
          io: data,
          filename: filename || File.basename(data),
          content_type: PDF_CONTENT_TYPE
        )
      else
        return false
    end

    user_report_pdf.set_generated_timestamps
    user_report_pdf.save!
    self.status = :prepared
    save!
  end

  def pdf_exists?(locale: nil)
    locale ||= effective_default_language
    user_report_pdf(locale: locale)&.pdf_file&.attached?
  end

  def remove_report_pdf!(locale: nil)
    remove_pdf_async(locale: locale)
    self.status = :not_prepared
    self.approval_status = :not_ready if has_approval_workflow?
    save!
  end

  def remove_pdf_and_update_status!
    return unless prepared?

    update!(status: :not_prepared, approval_status: :not_ready)
    remove_pdf_async
  end

  def remove_pdf_async(locale: nil)
    user_report_pdf(locale: locale)&.pdf_file&.purge_later
  end

  def pdf_download_url(locale: nil)
    return unless pdf_exists?(locale: locale)

    user_report_pdf(locale: locale)&.pdf_file&.url(
      disposition: 'attachment', filename: report_name_for_download
    )
  end

  def report_name_for_download
    report_name = Utility::String.remove_non_ascii_chars(report.name).strip.presence || 'report'
    "#{user.decorate.full_name}-#{report_name}-#{user.id}.pdf"
  end

  def find_or_create_user_report_pdf(locale: nil)
    locale ||= effective_default_language

    user_report_pdfs.find_or_create_by(locale: locale)
  end

  def user_report_pdf(locale: nil)
    locale ||= effective_default_language
    @user_report_pdf = user_report_pdfs.find_by(locale: locale)
  end

  def pdf_path(locale: nil)
    user_report_pdf(locale: locale)&.pdf_file&.key
  end

  def pdf_url(locale: nil, expires_in: 10.minutes)
    user_report_pdf(locale: locale)&.pdf_file&.url(expires_in: expires_in)
  end
end
