# frozen_string_literal: true

module Administration
  module Clients
    module Projects
      module Campaigns
        class SubCampaignsController < Administration::Clients::SubCampaignsController
          include Administration::Clients
          before_action :ensure_campaign

          def index
            @_filter_form = policy_scope(resource_class).sub_campaigns_of(campaign.id).search(params[:q])
            filter_form.archived_true ||= false
            filter_form.disabled_true ||= false
            @_resources = filter_form.result.page(params[:page])

            respond_to do |format|
              format.html
              format.js { render :index, formats: [:js] }
            end
          end

          def new
            @_resource = resource_class.new
            resource.parent = campaign
          end

          def export
            @_resources = policy_scope(resource_class).sub_campaigns_of(campaign.id)

            respond_to do |format|
              format.csv do
                headers['Content-Disposition'] = "attachment; filename=\"sub_campaigns-#{Date.today}.csv\""
                headers['Content-Type'] ||= 'text/csv'
              end
            end
          end

          def create
            @_resource = resource_class.new(resource_params)
            resource.parent = campaign
            super
          end

          private

          def resource_params
            params.require(:resource).permit(:name)
          end

          def init_breadcrumbs
            client_root_breadcrumb
            add_breadcrumb client.decorate.display_name, [:administration, client, :projects]
            add_breadcrumb project.decorate.display_name, administration_client_project_campaigns_path(client, project)
            add_breadcrumb campaign.decorate.display_name, action: :index
          end
        end
      end
    end
  end
end
