module Administration
  module Clients
    module Projects
      class CampaignsController < Administration::ClientsController
        def index
          @filter_form = policy_scope(project).children.search(params[:q])
          @filter_form.archived_true ||= false
          @resources = @filter_form.result.page(params[:page])

          respond_to do |format|
            format.html
            format.js { render :index, formats: [:js] }
          end
        end

        def new
          @resource = @resource_class.new
          @resource.parent = project
        end

        def export
          @resources = policy_scope(project).children

          respond_to do |format|
            format.csv do
              headers['Content-Disposition'] = "attachment; filename=\"projects-#{Date.today}.csv\""
              headers['Content-Type'] ||= 'text/csv'
            end
          end
        end

        def create
          @resource = @resource_class.new(resource_params)
          @resource.parent = project
          super
        end

        def i18n
          'clients.projects.campaigns'
        end

        private

        def resource_params
          params.require(:resource).permit(:name, :applicable_level)
        end

        def init_breadcrumbs
          add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
          add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
          add_breadcrumb client.decorate.display_name, [:administration, client, :projects]
          add_breadcrumb project.decorate.display_name, administration_client_project_campaigns_path(client, project)
        end
      end
    end
  end
end
