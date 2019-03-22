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
  # Exract the export functionality to a new method
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
    # TODO: Not the correct way to send all users result to the browser, adding user_id condition until better way is found
    @results = Assign.
               completed.
               includes(:membership, :user).
               where(assessment_id: @resource.assessment_ids).
               where(memberships: { client_id: @current_project.id, user_id: @current_membership.user_id }).
               references(:membership).
               all
    @assign = Assign.completed.find_by!(assessment_id: @resource.assessment_ids, membership_id: @current_membership.id)
    @assigns = Assign.where(assessment_id: @resource.assessment_ids, membership_id: @current_membership.membership_with_result.id)
    @translations = Translation.to_hash_for_report(@resource.id, @resource.assessment_id, user_locale)
    @available_translations = Translation.available_translation_for_report(@resource.id, @resource.assessment_id)
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || Report
  end

  def add_cookie_for_file_download
    cookies[:fileDownload] = true
  end
end
