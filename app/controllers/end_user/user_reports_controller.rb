# frozen_string_literal: true

class EndUser::UserReportsController < ApplicationController
  include AuthenticateByToken

  prepend_before_action :authenticate_by_token!, only: %i[pdf_preview]
  before_action :set_user_report

  # This action is used to generate pdf by puppeter
  def pdf_preview
    selected_locale = params[:lang] || @user_report.report.default_language

    @data = ::UserReports::PrepareDataForReportPreview.call!(@user_report, locale: selected_locale)

    render 'shared/preview_report', layout: 'pdf'
  end

  private

  def set_user_report
    @user_report = current_user.user_reports.find(params[:id])
  end
end
