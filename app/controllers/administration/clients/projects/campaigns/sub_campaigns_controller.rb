module Administration
  module Clients
    module Projects
      module Campaigns
        class SubCampaignsController < Administration::ClientsController
          def index
            @filter_form              = policy_scope(@resource_class).search(params[:q])
            @filter_form.parent_id_in = campaign.id
            @resources                = @filter_form.result.page(params[:page])

            respond_to do |format|
              format.html
              format.js { render :index, formats: [:js] }
            end
          end

          def new
            @resource = @resource_class.new
            @resource.parent = campaign
          end

          def create
            @resource = @resource_class.new(resource_params)
            @resource.parent = campaign
            super
          end

          def i18n
            'clients.projects.campaigns.sub_campaigns'
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
