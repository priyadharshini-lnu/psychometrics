module Administration
  module Clients
    module Users
      class ReportsController < Administration::BaseController
        include AuthenticateByToken
        # Turn off normally auth
        skip_before_action :authenticate_user!
        # Turn off browser auth
        skip_before_action :authenticate
        # Turn on auth by token
        prepend_before_action :authenticate_by_token!

        prepend_before_action :set_resource_class
        before_action :set_resource, :set_data
        append_before_action :init_breadcrumbs
        append_before_action :pundit_authorize, except: [:sidebar]

        def preview
          @results = Assign.
                     completed.
                     includes(:membership, :user).
                     where(memberships: { client_id: @client.id }, assessment_id: @resource.assessment_id).
                     references(:membership).
                     all
          @assign = Assign.find_by(assessment_id: @resource.assessment_id, membership_id: @membership.id)
          @translations = Translation.to_hash_for_report(@resource.id, @resource.assessment_id, user_locale)
          @available_translations = Translation.available_translation_for_report(@resource.id, @resource.assessment_id)
          respond_to do |format|
            format.html do
              render('_preview', layout: 'pdf') if params[:export]
            end
            format.pdf do
              pdf_file = Exports::Reports::Pdf::ReportExport.export(@current_user, @resource, @user, @client)
              send_file pdf_file, type: 'application/pdf'
            end
          end
        end

        private

        def init_breadcrumbs
          add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
          add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, @client, :users]
          add_breadcrumb @client.decorate.display_name, [:administration, @client, :users]
          add_breadcrumb @user.decorate.display_name, '#'
          add_breadcrumb I18n.t('administration.breadcrumbs.reports'), [:administration, @client, :user, :assigns, { user_id: @membership.id }]
        end

        # Set model
        def set_resource_class
          @resource_class ||= Report
        end

        def set_resource
          @resource = policy_scope(@resource_class).includes(pages: :modules).find(params[:id])
        end

        def set_data
          @client = policy_scope(Client).find(params[:client_id])
          @user = policy_scope(User).find(params[:user_id])
          @membership = @user.memberships.join_user.find_by(client_id: @client.id)
        end

        # Authorisation user
        def pundit_authorize
          authorize @resource || @resource_class
        end
      end
    end
  end
end
