# frozen_string_literal: true

class Assessors::UsersController < Administration::BaseController
  skip_before_action :enforce_geo_restriction, only: :dashboard
  skip_after_action :verify_policy_scoped, only: :index
  before_action :skip_authorization, only: %i[dashboard show]
  before_action :set_resource, only: [:show]
  # No role gate: like /admin, the page loads for any admin-side user; links + API policies decide what they see.
  render_entrypoint :dashboard, element: 'admin-app-container', entry: 'admin/admin'

  def index
    users = user_scope.ransack(params[:filters]).result
    paginated_users = users.page(params[:page])
    serialized_users = Panko::ArraySerializer.new(
      paginated_users, each_serializer: Administration::Assessors::UserSerializer,
      context: {
        current_user: current_user, project_id: campaign.project_id,
        evaluations_count: ::Assessors::SubjectEvaluationsCount.call!(
          paginated_users.pluck(:id), current_user, params[:campaign_id]
        ),
        moderation_count: ::Assessors::SubjectEvaluationsCount.call!(
          paginated_users.pluck(:id), current_user, params[:campaign_id],
          assessment_category: :lead_assessor_form
        )
      }
    ).to_a

    render json: {
      list: serialized_users,
      total: users.count
    }
  end

  def show
    grouped_user_assessments = UserAssessment.joins(:assessment).where(
      evaluator: current_user, subject: @user, campaign_id: params[:campaign_id],
      relationship: Relationship.assessor_relationship, assessment: { category: :assessor_form }
    ).group_by(&:assessment_id)

    recordings = ::MeetingRecordings::GetUserRecordings.call!(@user, params[:campaign_id], current_user)

    user_reports = UserReport.assessor_report_for_campaign(params[:campaign_id]).where(user_id: @user.id)
    serialized_user_assessments = grouped_user_assessments.map do |_key, user_assessments|
      Administration::Assessors::UserAssessmentSerializer.new(
        context: {
          status: user_assessments.all?(&:completed?) ? :completed : user_assessments.first.status,
          responses_count: user_assessments.count,
          project_id: campaign.project_id
        }
      ).serialize(user_assessments.first)
    end
    serialized_user_reports = Panko::ArraySerializer.new(
      user_reports, each_serializer: Administration::Assessors::UserReportSerializer
    ).to_a
    serialized_user_recordings = Panko::ArraySerializer.new(
      recordings,
      each_serializer: Administration::MeetingRecordingSerializer,
      context: { campaign: campaign, assessor_view: true }
    ).to_a
    render json: {
      user: Administration::Assessors::UserSerializer.new(
        context: {
          current_user: current_user,
          project_id: campaign.project_id,
          campaign: campaign
        }
      ).serialize(@user),
      user_assessments: serialized_user_assessments,
      user_reports: serialized_user_reports,
      user_recordings: serialized_user_recordings
    }
  end

  def pundit_authorize
    authorize(
      resource || resource_class,
      nil,
      project_id: campaign.project_id
    )
  end

  def campaign
    @campaign ||= Campaign.find_by(id: params[:campaign_id])
  end

  def dashboard; end

  private

  def project_flags
    match = params[:all]&.match(%r{campaigns/(\d+)})
    return {} unless match

    campaign_id = match[1]
    campaign = Campaign.
               includes(project: [:project_feature, { client: :client_feature }]).
               find_by(id: campaign_id)

    return {} unless campaign&.project

    project = campaign.project

    {
      enhanceWithAiEnabled:
        project.client.feature_enabled?(:enhance_with_ai) &&
          project.project_feature_enabled?(:enhance_with_ai)
    }
  end

  def set_resource
    @user = user_scope.find(params[:id])
  end

  def user_scope
    User.where(id: current_user.evaluation_assessments.where(campaign_id: params[:campaign_id]).select('subject_id'))
  end
end
