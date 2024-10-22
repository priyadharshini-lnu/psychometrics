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
      format.html do
        audit! :view_report, resource, campaign: resource.campaign,
          payload: params.merge(resource.details_to_log)
      end
      format.json do
        if resource.external_report? || resource.provider_custom_upload?
          return render(
            json: Administration::ExternalUserReportSerializer.new(
              context: { current_user: current_user }
            ).serialize(resource)
          )
        end

        render json: ::UserReportSerializer.new(
          context: {
            report: resource.report,
            results: UserReports::GroupedResultsByAssessment.call!(resource, view_report_as),
            piped_text_context: resource.piped_text_context,
            user_results: resource.user_results(view_report_as),
            view_report_as: view_report_as,
            current_user: current_user,
            campaign: resource.campaign,
            include: '**'
          }
        ).serialize(resource)
      end
    end
  end

  def download
    options = {
      lang: params[:lang],
      file_path: Settings.aws.s3.one_day_expiry_folder,
      async: true,
      notify_user: true,
      update_record: false,
      skip_logic: params[:skip_logic],
      view_report_as: view_report_as
    }
    data = ::UserReports::GeneratePdf.call!(resource, current_user, options)
    audit! :download_report, resource, campaign: resource.campaign,
      payload: params.merge(resource.details_to_log)
    respond_to do |format|
      format.pdf do
        send_tmp_file data[:file_path], type: 'application/pdf'
      end

      format.json { head :ok }
    end
  end

  # This action is used to generate pdf by puppeter
  def pdf_preview
    selected_locale = params[:lang] || resource.report.default_language

    @data = ::UserReports::PrepareDataForReportPreview.call!(resource, locale: selected_locale)
    @pdf_export = true

    render 'shared/preview_report', layout: 'pdf'
  end

  private

  def view_report_as
    raise NoMethodError, 'view_report_as method not defined'
  end
end
