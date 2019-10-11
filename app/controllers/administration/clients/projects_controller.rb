# frozen_string_literal: true

module Administration
  module Clients
    class ProjectsController < Administration::ClientsController
      include Administration::Clients
      before_action :ensure_client
      before_action :set_resource, only: %i[search_users show edit update destroy sidebar toggle_status copy archive]
      before_action :set_privacy_link_enabled, only: %i[new edit create update]

      def index
        @_filter_form = policy_scope(resource_class).
                        projects_of(client.id).
                        includes(
                          :creator,
                          :modifier,
                          :project_admin_memberships
                        ).
                        order('name asc').
                        search(params[:q])

        filter_form.disabled_true ||= false
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
        @_resource = resource_class.new
        @_resource.build_privacy_link
        resource.parent = client
      end

      def edit
        @_resource.privacy_link.present? || @_resource.build_privacy_link
      end

      def search_users
        users = ::Projects::UsersQuery.new(resource, params[:q]).to_a.map do |user|
          ::Projects::SearchUserSerializer.new(user).to_h
        end
        render json: users
      end

      def export
        @_resources = policy_scope(resource_class).projects_of(client.id).includes(:project_admins)
        respond_to do |format|
          format.csv do
            headers['Content-Disposition'] = "attachment; filename=\"projects-#{Date.today}.csv\""
            headers['Content-Type'] ||= 'text/csv'
          end
        end
      end

      def create
        @_resource = resource_class.new(resource_params)
        resource.parent = client
        super
      end

      def i18n
        'clients.projects'
      end

      private

      def init_breadcrumbs
        client_root_breadcrumb
        add_breadcrumb client.decorate.display_name, action: :index
      end

      def resource_params
        params.require(:resource).permit(:name, :subdomain, :logo, :background, :background_color,
                                         :remove_background, :remove_logo, :applicable_level, :number,
                                         :privacy_consent, :two_factor_enabled,
                                         privacy_link_attributes: %i[id text link _destroy])
      end

      def set_privacy_link_enabled
        @privacy_link_enabled = resource.privacy_link&.persisted? ||
                                params.dig(:resource, :privacy_link_attributes, :_destroy) == '0'
      end
    end
  end
end
