# frozen_string_literal: true

module Administration
  module Clients
    class ProjectsController < Administration::ClientsController
      include Administration::Clients
      before_action :ensure_client
      before_action :set_resource, only: %i[search_users show edit update destroy sidebar toggle_status copy archive]
      before_action :set_privacy_link_enabled, only: %i[new edit create update]
      append_before_action :pundit_authorize, except: %i[index sidebar]

      def index; end

      def new
        @_resource = resource_class.new
        @_resource.build_privacy_link
        @_resource.privacy_consent = true
        resource.parent = client
      end

      def edit
        @_resource.privacy_consent = false if @_resource.privacy_consent.nil?
        @_resource.privacy_link.present? || @_resource.build_privacy_link
      end

      def export
        @_resources = policy_scope(resource_class).projects_of(client.id).includes(:project_admins)
        audit! :export, resource, client: client
        respond_to do |format|
          format.csv do
            headers['Content-Disposition'] = "attachment; filename=\"projects-#{Time.zone.today}.csv\""
            headers['Content-Type'] ||= 'text/csv'
          end
        end
      end

      def update
        resource.modifier = current_user
        resource.assign_attributes(project_params)
        resource.operator = current_user
        respond_to do |format|
          if resource.save
            audit! :update, resource, payload: resource_params, project: resource
            format.js
          else
            format.js { render :edit }
          end
        end
      end

      def create
        @_resource ||= resource_class.new(project_params)
        resource.parent = client
        resource.creator = current_user
        resource.modifier = current_user
        resource.operator = current_user
        resource.applicable_level = :campaign
        respond_to do |format|
          if resource.save
            audit! :create, resource, payload: resource_params, project: resource
            format.js
          else
            format.js { render :new }
          end
        end
      end

      def i18n
        'clients.projects'
      end

      private

      def pundit_authorize
        authorize(
          resource || resource_class,
          nil,
          {
            project_id: client.id
          }
        )
      end

      def resource_params
        params.
          require(:resource).
          permit(:name, :subdomain, :applicable_level, :number,
                 :privacy_consent,
                 :enable_live_chat, :live_chat_token,
                 :webhook, :webhook_auth_enabled, :webhook_username, :webhook_password,
                 locales: [], privacy_link_attributes: %i[id text link _destroy]).
          reverse_merge({ locales: [] })
      end

      def project_params
        resource_params.except(:webhook, :webhook_auth_enabled, :webhook_username, :webhook_password)
      end

      def set_privacy_link_enabled
        @privacy_link_enabled = resource.privacy_link&.persisted? ||
                                params.dig(:resource, :privacy_link_attributes, :_destroy) == '0'
      end
    end
  end
end
