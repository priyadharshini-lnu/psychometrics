# frozen_string_literal: true

module Administration
  module Clients
    class StatisticsController < Administration::BaseController
      include Administration::Clients
      before_action :ensure_not_root
      before_action :set_resource_class
      append_before_action :pundit_authorize, :init_breadcrumbs

      # GET /administration/resources
      def index
        @_filter_form = policy_scope(resource_class).search(params[:q])
        @_resources = filter_form.
                      result.
                      joining do |a|
                        a.membership.on(a.membership.id.eq(a.membership_id) & (a.membership.client_id == client.id))
                      end .
                      joining { assessment }.
                      selecting do
                        ['COUNT(CASE WHEN assigns.status = 0 THEN 1 ELSE null END) AS new_count',
                         'COUNT(CASE WHEN assigns.status = 1 THEN 1 ELSE null END) AS in_progress_count',
                         'COUNT(CASE WHEN assigns.status = 2 THEN 1 ELSE null END) AS completed_count',
                         assessment.name,
                         assessment_id.as('id')]
                      end .
                      grouping { [assessment_id, assessment.name] }
        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      private

      def init_breadcrumbs
        client_root_breadcrumb
        add_breadcrumb client.client.decorate.display_name, [:administration, client.client, :projects]
        unless client.project_level?
          add_breadcrumb(
            client.project.decorate.display_name,
            administration_client_project_campaigns_path(client.client, client.project)
          )
        end
        add_breadcrumb client.decorate.display_name, administration_client_users_path(client)
        add_breadcrumb I18n.t('administration.breadcrumbs.statistics'), action: :index
      end

      # Set model
      def set_resource_class
        @_resource_class ||= Assign
      end

      # Authorisation user
      def pundit_authorize
        authorize resource_class
      end
    end
  end
end
