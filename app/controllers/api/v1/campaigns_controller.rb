module Api
  module V1
    class CampaignsController < BaseController
      def duplicate
        form = Api::V1::Campaigns::DuplicateForm.from_params(params)
        ::Campaigns::Duplicate.call(form, campaign) do
          on(:invalid) { |form| render_form_errors(form) }
          on(:ok) { |new_campaign| render json: Api::V1::CampaignSerializer.new(new_campaign).to_h }
        end
      end

      def index
        project_campaign_ids = Client.campaigns_and_sub_campaigns_of(project.id).ids
        campaigns = user.memberships.includes(:client).where(client_id: project_campaign_ids).map(&:client)
        render json: campaigns.map { |c| Api::V1::CampaignSerializer.new(c) }
      end

      def create
        form = Api::V1::Campaigns::AttachToUserForm.from_params(params).with_context(project: project, user: user)
        ::Campaigns::AttachToUser.call(form, user) do
          on(:invalid) { |form| render_form_errors(form) }
          on(:ok) { |user| render json: Api::V1::UserSerializer.new(user, project: project).to_h }
        end
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
