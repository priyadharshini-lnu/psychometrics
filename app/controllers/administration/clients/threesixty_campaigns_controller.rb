module Administration
  module Clients
    class ThreesixtyCampaignsController < Administration::ClientsController
      include Administration::Clients
      before_action :ensure_client
      wrap_parameters :threesixty_campaign, include: Threesixty::Campaign.attribute_names

      def index
        @_filter_form = client.threesixty_campaigns.search(params[:q])
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def show

      end

      def create
        campaign = Campaign.new(campaign_params)
        campaign.project_id = client.id
        campaign.build_threesixty_campaign(threesixty_campaign_params)
        campaign.save
      end

      def assessments
        type = params[:type]
        @assessments = if type == 'standard_360'
          CampaignTemplate.includes(:assessment).map(&:assessment)
        else
          client.threesixty_campaigns.map(&:threesixty_campaign).map(&:assessment)
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

      def i18n
        'clients.threesixty_campaigns'
      end

      private

      def init_breadcrumbs
        client_root_breadcrumb
        add_breadcrumb client.decorate.display_name, { action: :index }
      end

      def campaign_params
        params.require(:resource).permit(:name, :type)
      end

      def threesixty_campaign_params
        params.require(:resource).require(:threesixty_campaign).permit(:assessment_id, factors: [])
      end

      def set_resource_class
        @_resource_class ||= ::Campaign
      end

      def set_resource
        @_resource = policy_scope(resource_class).find(params[:threesixty_campaign_id] || params[:id])
      end
    end
  end
end
