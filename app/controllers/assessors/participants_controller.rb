# frozen_string_literal: true

class Assessors::ParticipantsController < Assessors::BaseController
  skip_before_action :enforce_geo_restriction
  skip_after_action :verify_policy_scoped

  def index
    query        = Assessors::ParticipantsQuery.new(current_user, params[:filters] || {})
    pairs        = query.pairs
    total        = query.total
    paginated    = pairs.page(params[:page])

    campaign_ids = paginated.map(&:campaign_id).uniq
    subject_ids  = paginated.map(&:subject_id).uniq
    project_ids  = paginated.map(&:campaign_project_id).uniq

    serialized = Panko::ArraySerializer.new(
      paginated,
      each_serializer: Administration::Assessors::ParticipantSerializer,
      context: {
        project_names: Project.where(id: project_ids).pluck(:id, :name).to_h,
        evaluations_count: Assessors::BulkSubjectEvaluationsCount.call!(
          subject_ids, current_user, campaign_ids
        ),
        moderation_statuses: Assessors::BulkSubjectEvaluationsCount.call!(
          subject_ids, current_user, campaign_ids, assessment_category: :lead_assessor_form
        )
      }
    ).to_a

    render json: { list: serialized, total: total, filter_options: query.filter_options }
  end
end
