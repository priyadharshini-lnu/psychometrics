class ReportsController < ApplicationController
  prepend_before_action :set_resource_class
  before_action :set_resource, only: [:show]
  append_before_action :pundit_authorize
  layout 'users'

  def show
    @results = Assign.
               completed.
               includes(:membership).
               where(memberships: { client_id: @current_client.id }, assessment_id: @resource.assessment_id).
               references(:membership).all

    @translations = Translation.to_hash_for_report(@resource.id, @resource.assessment_id, user_locale)

    respond_to do |format|
      format.html do
        render('_show', layout: 'pdf') if params[:export]
      end
      format.pdf do
        pdf_file = Exports::Reports::Pdf::ReportExport.export(@resource, @current_user, @current_client)
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
