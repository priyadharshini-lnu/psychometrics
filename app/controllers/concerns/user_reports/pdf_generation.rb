# frozen_string_literal: true

module UserReports::PdfGeneration
  extend ActiveSupport::Concern

  include AuthenticateByToken

  included do
    prepend_before_action :authenticate_by_token!, only: %i[pdf_preview]
    skip_before_action :enforce_admin_session_validity, only: %i[pdf_preview], raise: false
    before_action :enforce_admin_session_validity,
                  only: %i[pdf_preview],
                  unless: -> { params[:user_token].present? },
                  if: -> { respond_to?(:enforce_admin_session_validity, true) }
  end

  def show # rubocop:disable Metrics/AbcSize
    @available_translations = ::Translation.available_translation_for_report(resource.id, nil)
    @selected_locale = params[:report_lang] || resource.report.default_language

    audit! :view_report, resource, campaign: resource.campaign, payload: params.merge(resource.details_to_log)

    respond_to do |format| # rubocop:disable Metrics/BlockLength
      format.json do
        if resource.external_report? || resource.provider_custom_upload?
          return render(
            json: Administration::ExternalUserReportSerializer.new(
              context: { current_user: current_user }
            ).serialize(resource)
          )
        end

        Mobility.with_locale(params[:report_lang] || resource.report.default_language) do
          render json: ::UserReportSerializer.new(
            context: {
              report: resource.report,
              results: UserReports::GroupedResultsByAssessment.call!(resource, view_report_as, current_user),
              piped_text_context: resource.piped_text_context,
              user_results: resource.user_results(view_report_as),
              view_report_as: view_report_as,
              current_user: current_user,
              campaign: resource.campaign,
              threesixty_campaign: resource.threesixty_campaign,
              options: resource.threesixty_campaign&.option,
              lang: params[:report_lang],
              campaign_user: resource.campaign_user
            }
          ).serialize(resource)
        end
      end
    end
  end

  def download
    options = {
      lang: params[:report_lang] || resource.effective_default_language,
      file_path: Settings.aws.s3.one_day_expiry_folder,
      notify_user: true,
      update_record: false,
      skip_logic: params[:skip_logic],
      view_report_as: view_report_as
    }
    respond_to do |format|
      format.json do
        ::UserReports::GeneratePdfJob.perform_later(
          resource, current_user, options
        )

        render json: { success: true }
      end
      format.pdf do
        audit! :download_report, resource, campaign: resource.campaign,
               payload: params.merge(resource.details_to_log)
        data = ::UserReports::GeneratePdf.call!(resource, current_user, options)
        send_tmp_file data[:file_path], type: 'application/pdf'
      end
    end
  end

  # This action is used to generate pdf by puppeter
  def pdf_preview
    selected_locale = params[:lang] || resource.report.default_language
    I18n.locale = selected_locale

    Mobility.with_locale(selected_locale) do
      @data = ::UserReports::PrepareDataForReportPreview.call!(resource, locale: selected_locale)
    end
    @pdf_export = true

    render 'shared/preview_report', layout: 'pdf'
  end

  private

  def view_report_as
    raise NoMethodError, 'view_report_as method not defined'
  end
end
