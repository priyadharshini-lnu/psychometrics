# frozen_string_literal: true

class Assessors::EvaluationsController < Assessors::BaseController
  include ::Threesixty::SetAssessmentLocale

  skip_before_action :enforce_geo_restriction, except: :evaluate
  before_action :set_assessor_assessment, only: %i[show new_response]
  before_action :set_subject_user_assessment, only: %i[subject_assessment]

  def evaluate
    authorize(UserAssessment)
    campaign = Campaign.find(params[:campaign_id])
    user = User.find(params[:id])
    @assessor_assessments = policy_scope(UserAssessment).joins(:assessment).where(
      campaign_id: campaign.id, subject_id: user.id, assessments: { category: :assessor_form },
      relationship: Relationship.assessor_relationship
    ).order('completed_at DESC NULLS FIRST').order(:id)

    assessment_ids = @assessor_assessments.pluck('assessments.linked_assessment_id')

    @subject_user_assessment ||= UserAssessment.joins(:assessment).where(
      campaign_id: campaign.id,
      subject_id: user.id,
      evaluator_id: user.id,
      assessment_id: assessment_ids
    ).where.not(assessments: { category: Assessment::CATEGORIES[:meeting] })

    if campaign.datasheet
      datasheet_columns = Sheets::GetColumns.call!(campaign.datasheet, by_access: :assessor)
      datasheet = campaign.datasheet_data(user.email)
    end

    render json: {
      user_info: {
        user: UserSerializer.new.serialize(user),
        datasheet_columns: datasheet_columns || [],
        datasheet: datasheet&.slice(*datasheet_columns.map(&:name)) || {}
      },
      assessor_assessments: Panko::ArraySerializer.new(
        @assessor_assessments,
        each_serializer: Administration::ShortAssessorAssessmentSerializer,
        context: {
          campaign_assessor_assessments: campaign.campaign_assessor_assessments.index_by(&:assessment_id)
        }
      ).to_a.group_by { |a| a['assessment_id'] },

      subject_assessments: @subject_user_assessment.map do |a|
        { id: a.id, name: a.assessment.name, assessment_id: a.assessment.id }
      end
    }
  end

  def show
    @assessor_assessment.campaign.client.check_geo_restriction!
    user_result = @assessor_assessment.users_result
    attributes = {
      last_activity_at: DateTime.current,
      evaluation_session_id: Devise.friendly_token
    }
    attributes = attributes.merge(started_at: Time.zone.now) unless @assessor_assessment.started_at
    @assessor_assessment.update!(attributes)
    set_locale_for_user_assessment(@assessor_assessment)

    ::UserAssessments::ResetProgress.call!(@assessor_assessment) if params[:edit] == 'true'

    if params[:read] == 'true'
      @assessor_assessment.status = :in_progress
      user_result.current_element = nil
      user_result.current_page = 0
    end

    render json: serialize_data(@assessor_assessment, user_result)
  end

  def new_response
    @assessor_assessment.campaign.client.check_geo_restriction!
    unless @assessor_assessment.completed?
      return redirect_to assessors_campaign_evaluation_url(
        @assessor_assessment.campaign_id, @assessor_assessment.subject_id, tab: @assessor_assessment.assessment_id,
        assessment: @assessor_assessment.id
      )
    end

    new_user_assessment = UserAssessment.create(
      @assessor_assessment.slice(:campaign_id, :assessment_id, :subject_id, :evaluator_id, :relationship_id)
    )
    new_user_assessment.create_users_result

    redirect_to assessors_campaign_evaluation_url(
      @assessor_assessment.campaign_id, new_user_assessment.subject_id, tab: new_user_assessment.assessment_id,
      assessment: new_user_assessment.id
    )
  end

  def subject_assessment
    @subject_user_assessment.campaign.client.check_geo_restriction!
    user_result = @subject_user_assessment.users_result
    @subject_user_assessment.update(last_activity_at: DateTime.current)

    render json: serialize_data(@subject_user_assessment, user_result)
  end

  private

  def resource; end

  def serialize_data(user_assessment, user_result)
    selected_locale = user_assessment.selected_locale || user_locale

    {
      result: UsersResultSerializer.new(
        context: {
          campaign: user_assessment.campaign,
          participant: user_assessment,
          current_user: current_user,
          locale: selected_locale,
          piped_text_context: build_piped_context(user_assessment),
          include: '**'
        }
      ).serialize(user_result),

      assessment: AssessmentSerializer.new(
        context: {
          selected_locale: selected_locale,
          piped_text_context: build_piped_context(user_assessment),
          include: '**'
        }
      ).serialize(user_assessment.assessment)
    }
  end

  def set_assessor_assessment
    @assessor_assessment = policy_scope(UserAssessment).find(params[:id] || params[:evaluation_id])
    authorize([@assessor_assessment])
  end

  def set_subject_user_assessment
    @subject_user_assessment = evaluated_subject_assessments.find(params[:id] || params[:evaluation_id])
    authorize([@subject_user_assessment])
  end

  # A subject's own assessment is readable only for subjects the current assessor is assigned to evaluate.
  def evaluated_subject_assessments
    UserAssessment.where(
      'EXISTS (SELECT 1 FROM user_assessments evaluations ' \
      'WHERE evaluations.evaluator_id = :assessor_id ' \
      'AND evaluations.campaign_id = user_assessments.campaign_id ' \
      'AND evaluations.subject_id = user_assessments.subject_id)',
      assessor_id: current_user.id
    )
  end

  def build_piped_context(user_assessment)
    {
      evaluator: user_assessment.evaluator,
      subject: user_assessment.subject,
      campaign: user_assessment.campaign,
      result: user_assessment.users_result,
      assessment: user_assessment.assessment
    }
  end
end
