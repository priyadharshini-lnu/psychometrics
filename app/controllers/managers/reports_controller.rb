module Managers
  class ReportsController < BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: [:show]
    before_action :set_user
    append_before_action :pundit_authorize

    def show
      @results = Assign.
                 completed.
                 includes(:membership, :user).
                 where(memberships: { client_id: @current_client.id }, assessment_id: @resource.assessment_id).
                 references(:membership).all
      @assign = Assign.find_by(assessment_id: @resource.assessment_id, membership_id: @user_membership.id)

      @translations = Translation.to_hash_for_report(@resource.id, @resource.assessment_id, user_locale)

      respond_to do |format|
        format.html do
          render('_show', layout: 'pdf') if params[:export]
        end
        format.pdf do
          pdf_file = Exports::Reports::Pdf::ReportExport.export(@current_user, @resource, @user, @current_client)
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

    def set_user
      @user = User.find(params[:user_id])
      @user_membership = @user.memberships.join_user.find_by(client_id: @current_client.id)
    end

    def pundit_user
      { current_membership: @current_membership, current_user: @current_user, current_client: @current_client, user_membership: @user_membership }
    end

    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end
  end
end
