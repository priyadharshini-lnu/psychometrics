# TODO: Investigate possibility to remove
# Cause user no more need to view report
class ReportsController < ApplicationController
  include AuthenticateByToken
  # Turn off normally auth
  skip_before_action :authenticate_user!
  # Turn on auth by token
  prepend_before_action :authenticate_by_token!

  def show
    @resource = Report.enabled.available_to_view.includes(pages: [:modules]).find(params[:id])
    pundit_authorize
    prepare_data
    respond_to do |format|
      format.html do
        render('_show', layout: 'pdf') if params[:export]
      end
      format.pdf do
        add_cookie_for_file_download
        pdf_file = ::Exports::Reports::Pdf::ReportExport.export(@current_user, @resource, @current_user, @current_project, lang: user_locale)
        send_file pdf_file, type: 'application/pdf'
      end
    end
  end

  # Issue #122
  # Extract the export functionality to a new method
  # cause export flow must pass without obstacles
  #
  def export
    @resource = Report.enabled.includes(pages: [:modules]).find(params[:id])
    pundit_authorize
    prepare_data
    render('_show', layout: 'pdf')
  end

  private

  # Prepares data for draw report
  #
  def prepare_data
    args = {
      project: @current_project,
      campaign: nil,
      subject: nil,
      membership: @current_membership,
      report: @resource,
      locale: user_locale,
    }

    @data = Reports::PrepareDataForReport.call!(args)
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || Report
  end

  def add_cookie_for_file_download
    cookies[:fileDownload] = true
  end
end
