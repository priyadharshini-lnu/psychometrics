# frozen_string_literal: true

class EndUser::SavilleUserAssessmentsController < ApplicationController
  include AsyncRequestHandler
  include AuthenticateByLighthouseJwt

  skip_before_action :authenticate_user!, only: :redirect
  before_action :authenticate_by_lighthouse_jwt!, only: :redirect

  before_action :set_user_assessment, only: %i[pass redirect]
  before_action :can_start_based_on_sequencing, only: %i[pass]

  async_request :pass, handler: ::Saville::StartAssessment,
    permit_params: ->(params) { params.require(:saville_user_assessment).permit(:id) }

  def redirect
    campaign = @user_assessment.campaign

    if params[:error]
      Saville::HandleErrorCode.call!(params[:error], @user_assessment)
    elsif assessment_completed?
      @user_assessment.update!(status: :completed, completed_at: Time.current)
    end

    redirect_to(assessment_completed_path(campaign.id, user_assessment_id: @user_assessment.id),
                error: error_message)
  end

  private

  def assessment_completed?
    Saville::GetAssessmentStatus.call!(@user_assessment) == 'Completed'
  end

  def error_message
    if params[:error] == Saville::HandleErrorCode::ALREADY_STARTED_ERROR_CODE
      I18n.t('errors.assessments.timed_out',  assessment_name: @user_assessment.assessment.name)
    elsif params[:error]
      I18n.t('common.errors.something_wrong') if params[:error]
    end
  end

  def can_start_based_on_sequencing
    return if UserAssessments::CanStartBasedOnSequencing.call!(@user_assessment)

    redirect_to campaign_path(@user_assessment.campaign_id)
  end

  def set_user_assessment
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
  end
end
