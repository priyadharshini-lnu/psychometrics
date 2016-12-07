class ReportsController < ApplicationController
  include AuthenticateByToken
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:show]
  append_before_action :pundit_authorize

  # Turn off normally auth
  skip_before_action :authenticate_user!
  # Turn off browser auth
  skip_before_action :authenticate
  # Turn on auth by token
  prepend_before_action :authenticate_by_token!

  layout 'users'

  def show
    @results = Assign.
               completed.
               includes(:membership).
               where(memberships: { client_id: @current_client.id }, assessment_id: @resource.assessment_id).
               references(:membership).all
    @assign = Assign.find_by(assessment_id: @resource.assessment_id, membership_id: @current_membership.id)

    @translations = Translation.to_hash_for_report(@resource.id, @resource.assessment_id, user_locale)
    respond_to do |format|
      format.html do
        render('_show', layout: 'pdf') if params[:export]
      end
      format.pdf do
        pdf_file = Exports::Reports::Pdf::ReportExport.export(@current_user, @resource, @current_user, @current_client)
        send_file pdf_file, type: 'application/pdf'
      end
    end
  end

  private

  # Set model
  def set_resource_class
    @resource_class ||= Report
  end

  def set_resource
    @resource = @resource_class.enabled.available_to_view.find(params[:id])
  end

  # Authorisation user
  def pundit_authorize
    authorize @resource || @resource_class
  end
end
