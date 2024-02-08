# frozen_string_literal: true

class Assessors::CampaignsController < Assessors::BaseController
  skip_after_action :verify_policy_scoped, only: :index

  def index
    search = policy_scope(Campaign).ransack(params[:filters])
    search.sorts = 'id desc' if search.sorts.empty?

    campaigns = search.result
    paginated_campaigns = campaigns.page(params[:page])
    serialized_campaigns = Panko::ArraySerializer.new(
      paginated_campaigns, each_serializer: Administration::Assessors::CampaignSerializer,
      context: {
        subject_evaluation_statuses_count: Assessors::SubjectStatusesCount.call!(
          current_user, paginated_campaigns.pluck(:id)
        ),
        subject_moderation_statuses_count: Assessors::SubjectStatusesCount.call!(
          current_user, paginated_campaigns.pluck(:id), assessment_category: :lead_assessor_form
        )
      }
    ).to_a
    render json: {
      list: serialized_campaigns,
      total: campaigns.count
    }
  end
end
