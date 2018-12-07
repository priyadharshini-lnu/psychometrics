module Administration
  module Clients
    class ProjectsController < Administration::ClientsController
      include Administration::Clients
      before_action :ensure_client

      def index
        @_filter_form = policy_scope(resource_class)
            .projects_of(client.id)
            .includes(:project_admins, :assigned_memberships, :completed_memberships, :end_memberships, :license_usages)
            .order('name asc')
            .search(params[:q])
        filter_form.disabled_true ||= false
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
        @_resource = resource_class.new
        resource.parent = client
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
        add_breadcrumb client.decorate.display_name, { action: :index }
      end

      def resource_params
        params.require(:resource).permit(:name, :subdomain, :logo, :background, :background_color,
                                         :remove_background, :remove_logo, :applicable_level, :number, :privacy_consent,
                                         report_ids: [])
      end
    end
  end
end
