module Administration
  module Clients
    class ProjectsController < Administration::ClientsController
      def index
        @filter_form = policy_scope(@resource_class).search(params[:q])
        @filter_form.parent_id_in = client.id
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

      def create
        @resource = @resource_class.new(resource_params)
        @resource.parent = client
        super
      end

      private

      def init_breadcrumbs
        add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
        add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
        add_breadcrumb client.decorate.display_name, '#'
        add_breadcrumb I18n.t('administration.breadcrumbs.projects'), { action: :index }
      end
    end
  end
end
