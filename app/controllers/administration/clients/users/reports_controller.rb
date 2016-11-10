module Administration
  module Clients
    module Users
      class ReportsController < Administration::BaseController
        # Turn off normally auth
        skip_before_action :authenticate_user!
        # Turn off browser auth
        skip_before_action :authenticate, only: [:preview]
        # Turn on auth by token
        prepend_before_action :authenticate_user_from_token!
        before_action :authenticate, except: [:preview]

        prepend_before_action :set_resource_class, :set_user, :set_client
        before_action :set_resource
        before_action :init_breadcrumbs
        append_before_action :pundit_authorize, except: [:sidebar]

        def preview
          @membership = @user.memberships.find_by(client_id: @client.id)
          @results = Assign.completed.includes(:membership, :user).
              where(memberships: {client_id: @client.id}, assessment_id: @resource.assessment_id).
              references(:membership).all
          respond_to do |format|
            format.html do
              render('_preview', layout: 'pdf') if params[:export]
            end
            format.pdf do
              renderer = PdfRenderer.new(@resource, self, current_user.authentication_token)
              send_file renderer.render, type: 'application/pdf'
            end
          end
        end

        private

        def init_breadcrumbs
          add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
          add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, @client, :users]
          add_breadcrumb @client.decorate.display_name, [:administration, @client, :users]
          add_breadcrumb @user.decorate.display_name, '#'
          add_breadcrumb I18n.t('administration.breadcrumbs.reports'), [:administration, @client, :user, :assigns, { user_id: @user }]
        end

        # Set model
        def set_resource_class
          @resource_class ||= Report
        end

        def set_resource
          @resource = policy_scope(@resource_class).find(params[:id])
        end

        def set_user
          @user = policy_scope(User).find(params[:user_id])
        end

        def set_client
          @client = policy_scope(Client).find(params[:client_id])
        end

        # Authorisation user
        def pundit_authorize
          authorize @resource || @resource_class
        end

        def authenticate_user_from_token!
          user_token = params[:user_token].presence
          user       = user_token && User.find_by(authentication_token: user_token.to_s)
          sign_in(user, store: false) if user
          authenticate_user!
        end
      end
    end
  end
end
