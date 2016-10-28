module Managers
  class ReportsController < BaseController
    prepend_before_action :set_resource_class
    before_action :set_resource, only: [:show]
    before_action :set_user
    append_before_action :pundit_authorize

    def show
      @results = Assign.completed.where(client_id: @current_client.id, assessment_id: @resource.assessment_id).all
      respond_to do |format|
        format.html do
          render('_show', layout: 'pdf') if params[:export]
        end
        format.pdf do
          renderer = PdfRenderer.new(@resource, self, current_user.authentication_token)
          # Generate specific url for render html to PDF
          url = url_for({
            action: :show,
            id: @resource,
            export: true,
            user_token: @user_token,
            subdomain: @current_client.subdomain
          })
          send_file renderer.render({ url: url }), type: 'application/pdf'
        end
      end
    end

    private

    # Set model
    def set_resource_class
      @resource_class ||= Report
    end

    def set_resource
      @resource = @resource_class.find(params[:id])
    end

    def set_user
      @user = User.find(params[:user_id])
    end

    def pundit_user
      { current_user: current_user, current_client: @current_client, user: @user }
    end

    # Authorisation user
    def pundit_authorize
      authorize @resource || @resource_class
    end
  end
end
