# frozen_string_literal: true

module Administration
  module Clients
    class ApiKeysController < Administration::BaseController
      include Administration::Clients
      prepend_before_action :set_resource_class
      prepend_before_action :set_user
      before_action :ensure_client
      before_action :set_resource, only: %i[toggle_status]
      append_before_action :init_breadcrumbs, except: %i[new create]
      append_before_action :pundit_authorize

      def index
        @_filter_form = policy_scope(resource_class).search(params[:q])
        filter_form.user_id_in = @user.id
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def create
        CreateApiKey.call(@user) do
          on(:invalid) { render(:error, locals: { message: t('errors.error_500') }) }
          on(:ok) { |api_key| self.resource = api_key }
        end
      end

      # Change resources's status to active/disabled
      #
      def toggle_status
        resource.toggle!(:disabled)
      end

      def i18n
        'clients.api_keys'
      end

      protected

      def init_breadcrumbs
        client_root_breadcrumb
        add_breadcrumb(client.client.decorate.display_name, [:administration, client.client, :projects])
        if @membership.client_admin?
          add_breadcrumb(t('administration.navigation.client_admins'), [:administration, client.client, :client_admins])
        end
        if @membership.project_admin?
          add_breadcrumb(client.project.decorate.display_name, [:administration, client, :campaigns])
          add_breadcrumb(t('administration.navigation.project_admins'), [:administration, client, :project_admins])
        end

        add_breadcrumb t('.breadcrumb', name: @user.decorate.display_name)
      end

      def create_resource_params
        params.require(:resource).permit(:token)
      end

      def update_resource_params
        params.require(:resource).permit(:token)
      end

      def set_resource_class
        @_resource_class ||= ::ApiKey # rubocop:disable Naming/MemoizedInstanceVariableName
      end

      def set_user
        @membership = policy_scope(::Membership).find(params[:user_id])
        @user = @membership.user
      end

      def set_resource
        @_resource = policy_scope(resource_class).find(params[:id])
      end
    end
  end
end
