module Administration
  module Clients
    module Users
      class ReportsController < Administration::BaseController
        include AuthenticateByToken
        include Administration::Clients
        # Turn off normally auth
        skip_before_action :authenticate_user!
        # Turn on auth by token
        prepend_before_action :authenticate_by_token!

        prepend_before_action :set_resource_class
        before_action :set_resource, :set_data
        append_before_action :init_breadcrumbs
        append_before_action :pundit_authorize, except: [:sidebar]

        def preview
          args = {
            project: client.project,
            campaign: nil,
            subject: nil,
            membership: membership,
            report: resource,
            locale: user_locale,
          }

          @data = Reports::PrepareDataForReport.call!(args)

          respond_to do |format|
            format.html do
              render('_preview', layout: 'pdf') if params[:export]
            end
            format.pdf do
              add_cookie_for_file_download
              pdf_file = ::Exports::Reports::Pdf::ReportExport.export(@current_user, resource, user, client, lang: user_locale)
              send_file pdf_file, type: 'application/pdf'
            end
          end
        end

        private

        def init_breadcrumbs
          client_root_breadcrumb
          add_breadcrumb client.decorate.display_name, administration_client_users_path(client)
          add_breadcrumb user.decorate.display_name, administration_client_user_assigns_path(client_id: client.id, user_id: user_membership_for_current_client.id || membership.id)
          add_breadcrumb I18n.t('administration.breadcrumbs.reports'), [:administration, client, :user, :assigns, { user_id: membership.id }]
        end

        def set_resource_class
          @_resource_class = Report
        end

        def set_resource
          @_resource = policy_scope(resource_class).includes(pages: :modules).find(params[:id])
        end

        def pundit_authorize
          raise Pundit::NotAuthorizedError, 'Wrong Membership' unless policy(membership).overview_assigns?
          super
        end

        def set_data
          @_client = policy_scope(Client).find(params[:client_id])
          @_user = policy_scope(User).find(params[:user_id])
          @_membership = user.memberships.join_user.find_by(client_id: client.project.id)
        end

        def user_membership_for_current_client
          Membership.find_by(client_id: client.id, user_id: user.id)
        end

        def add_cookie_for_file_download
          cookies[:fileDownload] = true
        end
      end
    end
  end
end
