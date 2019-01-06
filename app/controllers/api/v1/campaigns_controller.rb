module Api
  module V1
    class CampaignsController < ProjectScopeController
      def duplicate
        form = Api::V1::Campaigns::DuplicateForm.from_params(params)
        return render_form_errors(form) if form.invalid?

        duplicated_campaign = campaign.dup
        duplicated_campaign.update!(form.attributes)
        duplicated_campaign.reports = campaign.reports

        render json: Api::V1::CampaignSerializer.new(duplicated_campaign).to_h
      end

      def index
        project_campaign_ids = Client.campaigns_and_sub_campaigns_of(project.id).ids
        campaigns = user.memberships.includes(:client).where(client_id: project_campaign_ids).map(&:client)
        render json: campaigns.map { |c| Api::V1::CampaignSerializer.new(c) }
      end
      def create
        render json: Api::V1::UserSerializer.new(User.last, project: project).to_h
      end

      def user
        @user ||= ::Users::Regular.find_by(project_id: params[:project_id], id: params[:user_id])
      end

      def campaign
        @campaign ||= Client.campaigns_and_sub_campaigns_of(project.id).find(params[:id])
      end
    end
  end
end
