module Administration
  module Clients
    module Projects
      module Campaigns
        class SubCampaignsController < Administration::Clients::SubCampaignsController
          def index
            @filter_form = policy_scope(campaign).children.search(params[:q])
            @filter_form.archived_true ||= false
            @resources = @filter_form.result.page(params[:page])

            respond_to do |format|
              format.html
              format.js { render :index, formats: [:js] }
            end
          end

          def new
            @resource = @resource_class.new
            @resource.parent = campaign
          end

          def export
            @resources = policy_scope(campaign).children

            respond_to do |format|
              format.csv do
                headers['Content-Disposition'] = "attachment; filename=\"sub_campaigns-#{Date.today}.csv\""
                headers['Content-Type'] ||= 'text/csv'
              end
            end
          end

          def create
            @resource = @resource_class.new(resource_params)
            @resource.parent = campaign
            super
          end

          private

          def resource_params
            params.require(:resource).permit(:name)
          end

          def init_breadcrumbs
            add_breadcrumb I18n.t('administration.breadcrumbs.home'), [:administration, :root]
            add_breadcrumb I18n.t('administration.breadcrumbs.clients'), [:administration, :clients]
            add_breadcrumb client.decorate.display_name, [:administration, client, :projects]
            add_breadcrumb project.decorate.display_name, administration_client_project_campaigns_path(client, project)
            add_breadcrumb campaign.decorate.display_name, { action: :index }
          end
        end
      end
    end
  end
end
