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
        form = Api::V1::Campaigns::AttachToUserForm.from_params(params.merge(project: project, user: user))
        return render_form_errors(form) if form.invalid?

        form.campaign_ids.each do |client_id|
          user.memberships.create!(role: Membership::MEMBER_ROLE, client_id: client_id)
        end

        render json: Api::V1::UserSerializer.new(user, project: project).to_h
      end

      def campaign
        @campaign ||=
          begin
            c = Client.campaigns_and_sub_campaigns_of(project.id).find_by(id: params[:id])
            raise Errors::ApiError, "Campaign with id=#{params[:id]} is not found" unless c
            c
          end
      end
    end
  end
end
