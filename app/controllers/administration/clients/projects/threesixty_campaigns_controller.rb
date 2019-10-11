# frozen_string_literal: true

module Administration
  module Clients
    module Projects
      class ThreesixtyCampaignsController < Administration::ThreesixtyCampaigns::BaseController
        include Administration::Clients
        before_action :ensure_project
        prepend_before_action :set_resource_class
        before_action :set_resource, only: %i[show edit update sidebar toggle_status copy archive]
        before_action :init_breadcrumbs
        wrap_parameters :threesixty_campaign, include: ::Threesixty::Campaign.attribute_names

        def show
          @init_state = {
            project: {
              datasheetFields: resource.datasheet_column_names,
              relationships: ::Relationships::ByCampaign.new(resource.campaign).to_a
            },
            threeSixtyCampaign: {
              campaignDetails: {
                id: resource.id,
                name: resource.name,
                reportId: resource.report_id,
                dimensionId: resource.assessment.dimension_id,
                options: {
                  participants: resource.option.participants
                }
              }
            }
          }
        end

        def index
          @_filter_form = project.project_campaigns.
                          includes(
                            :threesixty_campaign,
                            threesixty_campaign: %i[assessment report]
                          ).
                          search(params[:q])
          @_resources = filter_form.result.page(params[:page])

          respond_to do |format|
            format.html
            format.js { render :index, formats: [:js] }
          end
        end

        def new
          @_resource = Campaign.new
        end

        def create
          @_resource = ::Threesixty::Campaigns::Create.call!(project, campaign_params, threesixty_campaign_params)
        end

        def assessments
          type = params[:type]
          @assessments = if type == ::Threesixty::Campaign::STANDARD_360
                           CampaignTemplate.includes(:assessment).map(&:assessment)
                         else
                           project.project_campaigns.map(&:threesixty_campaign).map(&:assessment)
                         end
        end

        def factors
          @factors = if params[:assessment_id].present?
                       assessment = Assessment.find(params[:assessment_id])
                       assessment.dimension.factors
                     else
                       []
                     end
        end

        def destroy
          campaign = project.project_campaigns.find(params[:id])
          campaign.destroy
          @_resource = campaign
          respond_to do |format|
            format.js
          end
        end

        def i18n
          'clients.threesixty_campaigns'
        end

        private

        def campaign_params
          params.require(:resource).permit(:name)
        end

        def threesixty_campaign_params
          params.require(:resource).require(:threesixty_campaign).permit(:assessment_id, factors: [])
        end

        def set_resource_class
          @_resource_class ||= ::Threesixty::Campaign # rubocop:disable Naming/MemoizedInstanceVariableName
        end

        def threesixty_campaign
          @threesixty_campaign ||= ::Threesixty::Campaign.find_by(id: params[:id])
        end

        def init_breadcrumbs
          client_root_breadcrumb
          add_breadcrumb client.decorate.display_name, [:administration, client, :projects]
          add_breadcrumb project.decorate.display_name, administration_client_project_campaigns_path(client, project)
          add_breadcrumb(
            t('administration.clients.projects.threesixty_campaigns.index.title'),
            administration_client_project_threesixty_campaigns_path(client, project)
          )
          add_breadcrumb resource.campaign.name, action: :show if params[:action] == 'show'
        end
      end
    end
  end
end
