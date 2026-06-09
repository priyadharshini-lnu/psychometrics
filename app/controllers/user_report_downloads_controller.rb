# frozen_string_literal: true

class UserReportDownloadsController < ApplicationController
  skip_before_action :set_client_by_subdomain, only: [:pdf_download_link]

  append_before_action :pundit_authorize
  append_after_action :verify_authorized

  def pdf_download_link
    locale = params[:locale]
    filename = user_report.report_name_for_download(locale: locale)
    pdf_url = user_report.user_report_pdf(locale: locale)&.pdf_file&.url(
      disposition: 'attachment', filename: filename
    )

    if pdf_url
      audit_download_or_view_action(locale, filename)
      redirect_to(pdf_url)
    else
      render json: { error: I18n.t('shared.user_report_pdf_url_not_generated') }, status: :unprocessable_entity
    end
  end

  private

  def audit_download_or_view_action(locale, filename)
    return if params[:view] == 'true'

    audit! :download_report, user_report, payload: {
      user_report_id: user_report.id,
      report_name: user_report.report&.name,
      locale: locale,
      filename: filename
    }
  end

  def user_report
    # FIXME: Temp logic to resolve assessor case
    if current_user.is?(:assessor)
      user_report = UserReport.find_by(id: params[:id])
      if UserReportDownloadPolicy.new({ current_user: current_user }, user_report).assessor_can_access_report?
        @user_report ||= user_report
      end
    else
      @user_report ||= current_user.user_reports.find_by(id: params[:id]) ||
                       UserReportDownloadPolicy::Scope.new(current_user, UserReport).resolve.find(params[:id])
    end
  end

  def pundit_authorize
    raise Pundit::NotAuthorizedError unless user_report

    authorize(
      user_report,
      :pdf_download_link?,
      policy_class: UserReportDownloadPolicy
    )
  end
end
