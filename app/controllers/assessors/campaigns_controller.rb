# frozen_string_literal: true

class Assessors::CampaignsController < Assessors::BaseController
  skip_after_action :verify_policy_scoped, only: :index

  def index
    search = policy_scope(Campaign).ransack(params[:filters])
    search.sorts = 'id desc' if search.sorts.empty?

    campaigns = search.result
    paginated_campaigns = campaigns.page(params[:page])
    serialized_campaigns = ActiveModelSerializers::SerializableResource.new(
      paginated_campaigns, each_serializer: Administration::Assessors::CampaignSerializer,
      subject_statuses_count: Assessors::SubjectStatusesCount.call!(current_user, paginated_campaigns.pluck(:id))
    )

    render json: {
      list: serialized_campaigns,
      total: campaigns.count
    }
  end
end
