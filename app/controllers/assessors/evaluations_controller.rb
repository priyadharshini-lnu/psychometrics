# frozen_string_literal: true

class Assessors::EvaluationsController < Assessors::BaseController
  before_action :set_assessor_assessment, only: %i[show subject_assessment]

  def show
    user_result = @assessor_assessment.users_result
    user_result.update(current_element: nil, current_page: nil, status: :in_progress) if params[:edit] == 'true'

    user_result.update(last_activity_at: DateTime.current)
    render json: serialize_data(@assessor_assessment, user_result)
  end

  def subject_assessment
    user_result = subject_user_assessment.users_result

    user_result.update(last_activity_at: DateTime.current)
    render json: serialize_data(subject_user_assessment, user_result)
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
        to_hash(include: '**'),
      subject_user_assessment_id: subject_user_assessment&.id
    }
  end

  def set_assessor_assessment
    @assessor_assessment = policy_scope(UserAssessment).find_by!(id: params[:id] || params[:evaluation_id])
    authorize([@assessor_assessment])
  end

  def subject_user_assessment
    assessment_id = CampaignAssessment.find_by(assessor_form_id: @assessor_assessment.assessment_id,
                                                 campaign_id: @assessor_assessment.campaign_id)&.assessment_id
    return nil unless assessment_id

    @subject_user_assessment ||= UserAssessment.find_by!(campaign_id: @assessor_assessment.campaign_id,
                                                           subject_id: @assessor_assessment.subject_id,
                                                           evaluator_id: @assessor_assessment.subject_id,
                                                           assessment_id: assessment_id)
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
