# frozen_string_literal: true

module UserReports::PdfGeneration
  extend ActiveSupport::Concern

  include AuthenticateByToken

  included do
    prepend_before_action :authenticate_by_token!, only: %i[pdf_preview]
  end

  def show
    @available_translations = ::Translation.available_translation_for_report(resource.id, nil)
    @selected_locale = params[:lang] || resource.report.default_language

    respond_to do |format|
      format.json do
        render json: resource, report: resource.report,
              results: UserReports::GroupedResultsByAssessment.call!(resource),
              piped_text_context: {},
              user_results: resource.user_results,
              serializer: ::UserReportSerializer,
              include: '**'
      end
    end
  end

  def download
    options = { lang: params[:lang] }
    respond_to do |format|
      format.pdf do
        file_path = ::UserReports::GeneratePdf.call!(resource, current_user, options)

        send_file file_path, type: 'application/pdf'
      end
    end
  end

  # This action is used to generate pdf by puppeter
  def pdf_preview
    selected_locale = params[:lang] || resource.report.default_language

    @data = ::UserReports::PrepareDataForReportPreview.call!(resource, locale: selected_locale)

    render 'shared/preview_report', layout: 'pdf'
  end
end
