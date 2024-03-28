# frozen_string_literal: true

class Assessors::EvaluationsController < Assessors::BaseController
  include ::Threesixty::SetAssessmentLocale
  before_action :set_assessor_assessment, only: %i[show]
  before_action :set_subject_user_assessment, only: %i[subject_assessment]

  def evaluate # rubocop:disable Metrics/CyclomaticComplexity, Metrics/PerceivedComplexity
    authorize(UserAssessment)
    campaign = Campaign.find(params[:campaign_id])
    user = User.find(params[:id])
    @assessor_assessments = policy_scope(UserAssessment).joins(:assessment).where(
      campaign_id: campaign.id, subject_id: user.id, assessments: { category: :assessor_form },
      relationship: Relationship.assessor_relationship
    ).order(:id)

    assessment_ids = @assessor_assessments.map(&:assessment).map(&:linked_assessment_id)

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
        datasheet: datasheet&.slice(*datasheet_columns.map { |col| col['name'] }) || {}
      },
      assessor_assessments: @assessor_assessments.map do |a|
        { id: a.id, name: a.assessment.name, linked_assessment_id: a.assessment.linked_assessment_id }
      end,
      subject_assessments: @subject_user_assessment.map do |a|
        { id: a.id, name: a.assessment.name, assessment_id: a.assessment.id }
      end
    }
  end

  def show
    user_result = @assessor_assessment.users_result
    attributes = { last_activity_at: DateTime.current }
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

  def subject_assessment
    user_result = @subject_user_assessment.users_result
    @subject_user_assessment.update(last_activity_at: DateTime.current)

    render json: serialize_data(@subject_user_assessment, user_result)
  end

  private

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

      assessment: AssessmentSerializer.new(user_assessment.assessment,
                                           selected_locale: selected_locale,
                                           piped_text_context: build_piped_context(user_assessment)).
        to_hash(include: '**')
    }
  end

  def set_assessor_assessment
    @assessor_assessment = policy_scope(UserAssessment).find(params[:id] || params[:evaluation_id])
    authorize([@assessor_assessment])
  end

  def set_subject_user_assessment
    @subject_user_assessment = UserAssessment.find(params[:id] || params[:evaluation_id])
    authorize([@subject_user_assessment])
  end

  def build_piped_context(user_assessment)
    {
      evaluator: user_assessment.evaluator,
      subject: user_assessment.subject,
      campaign: user_assessment.campaign,
      result: user_assessment.users_result
    }
  end
end
