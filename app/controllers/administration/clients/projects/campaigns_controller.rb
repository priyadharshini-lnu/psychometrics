module Administration
  module Clients
    module Projects
      class CampaignsController < Administration::Clients::CampaignsController
        before_action :ensure_project

        def index
          @filter_form = policy_scope(resource_class).campaigns_of(project.id).enabled.includes(:license_usages).search(params[:q])
          @filter_form.archived_true ||= false
          @resources = @filter_form.result.page(params[:page])

          respond_to do |format|
            format.html
            format.js { render :index, formats: [:js] }
          end
        end

        def new
          @_resource = resource_class.new
          resource.parent = project
        end

        def export
          @resources = policy_scope(resource_class).campaigns_of(project.id)

          respond_to do |format|
            format.csv do
              headers['Content-Disposition'] = "attachment; filename=\"campaigns-#{Date.today}.csv\""
              headers['Content-Type'] ||= 'text/csv'
            end
          end
        end

        def create
          @_resource = resource_class.new(resource_params)
          resource.parent = project
          super
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

        def ensure_project
          project || raise(Pundit::NotAuthorizedError)
        end
      end
    end
  end
end
