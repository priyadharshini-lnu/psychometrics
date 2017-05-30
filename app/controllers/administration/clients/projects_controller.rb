module Administration
  module Clients
    class ProjectsController < Administration::ClientsController
      def index
        @filter_form = policy_scope(client).children.includes(:admins, :assigned_memberships, :license_usages, :completed_memberships).search(params[:q])
        @filter_form.archived_true ||= false
        @resources = @filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def new
        @resource = @resource_class.new
        @resource.parent = client
      end

      def export
        @resources = policy_scope(client).children.includes(:admins)

        respond_to do |format|
          format.csv do
            headers['Content-Disposition'] = "attachment; filename=\"projects-#{Date.today}.csv\""
            headers['Content-Type'] ||= 'text/csv'
          end
        end
      end

      def create
        @resource = @resource_class.new(resource_params)
        @resource.parent = client
        super
      end

      def i18n
        'clients.projects'
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
        add_breadcrumb client.decorate.display_name, { action: :index }
      end

      def set_resource
        @resource = policy_scope(@resource_class).find(params[:id])
      end

      def resource_params
        params.require(:resource).permit(:name, :subdomain, :logo, :background, :background_color,
                                         :remove_background, :remove_logo, :applicable_level, :number,
                                         report_ids: [])
      end
    end
  end
end
