# frozen_string_literal: true

class Assessors::EvaluationsController < Assessors::BaseController
  before_action :set_assessor_assessment, only: %i[show]
  before_action :set_subject_user_assessment, only: %i[subject_assessment]

  def evaluate
    authorize(UserAssessment)
    campaign = Campaign.find(params[:campaign_id])
    user = User.find(params[:id])
    @assessor_assessments = policy_scope(UserAssessment).where(campaign_id: campaign.id, subject_id: user.id)

    assessment_ids = CampaignAssessment.where(
      assessor_form_id: @assessor_assessments.map(&:assessment_id),
      campaign_id: campaign.id
    ).map(&:assessment_id)

    @subject_user_assessment ||= UserAssessment.where(campaign_id: campaign.id,
                                                        subject_id: user.id,
                                                        evaluator_id: user.id,
                                                        assessment_id: assessment_ids)
    datasheet = campaign.datasheet_data(user.email)
    render json: {
      user_info: {
        user: UserSerializer.new(user).to_hash,
        datasheet: datasheet,
        datasheet_columns: campaign.datasheet_columns
      },
      assessor_assessments: @assessor_assessments.map { |a| { id: a.id, name: a.assessment.name } },
      subject_assessments: @subject_user_assessment.map { |a| { id: a.id, name: a.assessment.name } }
    }
  end

  def show
    user_result = @assessor_assessment.users_result
    attributes = { last_activity_at: DateTime.current }
    attributes = attributes.merge(started_at: Time.now) unless user_result.started_at
    user_result.update(attributes)

    ::UsersResults::Edit.call!(user_result) if params[:edit] == 'true'

    if params[:read] == 'true'
      user_result.status = :in_progress
      user_result.current_element = nil
      user_result.current_page = 0
    end

    render json: serialize_data(@assessor_assessment, user_result)
  end

  def subject_assessment
    user_result = @subject_user_assessment.users_result

    user_result.update(last_activity_at: DateTime.current)
    render json: serialize_data(@subject_user_assessment, user_result)
  end

  private

  def serialize_data(user_assessment, user_result)
    selected_locale = user_assessment.selected_locale || user_locale

    {
      result: UsersResultSerializer.new(user_result, campaign: user_assessment.campaign,
                                          participant: user_assessment,
                                          current_user: current_user, locale: selected_locale,
                                          piped_text_context: build_piped_context(user_assessment)).
        to_hash(include: '**'),
      assessment: AssessmentSerializer.new(user_assessment.assessment,
                                           selected_locale: selected_locale,
                                           piped_text_context: build_piped_context(user_assessment)).
        to_hash(include: '**')
    }
  end

  def set_assessor_assessment
    @assessor_assessment = policy_scope(UserAssessment).find_by!(id: params[:id] || params[:evaluation_id])
    authorize([@assessor_assessment])
  end

  def set_subject_user_assessment
    @subject_user_assessment = UserAssessment.find_by!(id: params[:id] || params[:evaluation_id])
    authorize([@subject_user_assessment])
  end

  def build_piped_context(user_assessment)
    {
      evaluator: user_assessment.evaluator,
      subject: user_assessment.subject,
      threesixty_campaign: {},
      result: user_assessment.users_result
    }
  end
end
