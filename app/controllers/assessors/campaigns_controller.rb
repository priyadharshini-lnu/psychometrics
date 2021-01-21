# frozen_string_literal: true

class Assessors::CampaignsController < Assessors::BaseController
  skip_after_action :verify_policy_scoped, only: :index

  def index
    campaigns = policy_scope(Campaign).ransack(params[:filters]).
                result
    serialized_campaigns = ActiveModelSerializers::SerializableResource.new(
      campaigns.page(params[:page]), each_serializer: Administration::Assessors::CampaignSerializer
    )

    render json: {
      list: serialized_campaigns,
      total: campaigns.count
    }
  end
end
