module Administration
  module Clients
    class ThreesixtyCampaignsController < Administration::ClientsController
      include Administration::Clients
      before_action :ensure_client

      def index
        @_filter_form = client.threesixty_campaigns.search(params[:q])
        @_resources = filter_form.result.page(params[:page])

        respond_to do |format|
          format.html
          format.js { render :index, formats: [:js] }
        end
      end

      def create
        campaign = Campaign.new(campaign_params)
        campaign.project_id = client.id
        campaign.save
        super
      end

      def dimensions
        if params[:assessment_id].present?
          assessment = Assessment.find(params[:assessment_id])
          @dimension = assessment.dimension
          @dimensions = [@dimension]
        else
          @dimensions = Dimension.all
          @dimension = @dimensions.first
        end
      end

      def factors
        @factors = if params[:dimension_id].present?
          dimension = Dimension.find(params[:dimension_id])
          dimension.factors
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
        params.permit(:name)
      end

      def threesixty_params
        params.permit(:assessment_id, :report_id, threesixty_campaign: {})
      end
    end
  end
end
