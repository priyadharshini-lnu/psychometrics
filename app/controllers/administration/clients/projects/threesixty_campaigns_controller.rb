module Administration
  module Clients
    module Projects
      class ThreesixtyCampaignsController < Administration::Clients::CampaignsController
        include Administration::Clients
        before_action :ensure_project
        before_action :set_resource, only: %i[show edit update sidebar toggle_status copy archive]
        wrap_parameters :threesixty_campaign, include: ::Threesixty::Campaign.attribute_names

        def show; end

        def index
          @_filter_form = project.project_campaigns.search(params[:q])
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
          campaign = project.project_campaigns.build(campaign_params)
          campaign.project_id = project.id
          campaign.type = Campaign::THREESIXTY
          threesixty = campaign.build_threesixty_campaign(threesixty_campaign_params)
          if threesixty.assessment.present?
            ::Threesixty::CreateFromAssessment.call(threesixty)
          else
            ::Threesixty::CreateEmptyCampaign.call(threesixty)
          end
          campaign.save
          @_resource = campaign
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
          @_resource_class ||= ::Threesixty::Campaign
        end

        def init_breadcrumbs
          client_root_breadcrumb
          add_breadcrumb client.decorate.display_name, [:administration, client, :projects]
          add_breadcrumb project.decorate.display_name, administration_client_project_campaigns_path(client, project)
        end
      end
    end
  end
end
