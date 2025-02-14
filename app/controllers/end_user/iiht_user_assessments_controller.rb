# frozen_string_literal: true

class EndUser::IihtUserAssessmentsController < ApplicationController
  include AsyncRequestHandler
  include AuthenticateByLighthouseJwt

  skip_before_action :authenticate_user!, only: :redirect
  before_action :authenticate_by_lighthouse_jwt!, only: :redirect

  before_action :set_user_assessment, only: %i[pass]
  before_action :can_start_based_on_sequencing, only: %i[pass]

  async_request :pass, handler: ::Iiht::StartAssessment,
    permit_params: ->(params) { params.require(:iiht_user_assessment).permit(:id) }

  def redirect
    user_assessment = current_user.user_assessments.find_by!(
      campaign_id: params[:campaign_id], assessment_id: params[:assessment_id]
    )
    user_assessment.complete! unless user_assessment.completed?
    ::Iiht::SaveScoresJob.perform_later(user_assessment)

    redirect_to(assessment_completed_path(user_assessment.campaign_id, user_assessment_id: user_assessment.id))
  end

  private

  def can_start_based_on_sequencing
    return if UserAssessments::CanStartBasedOnSequencing.call!(@user_assessment)

    redirect_to campaign_path(@user_assessment.campaign_id)
  end

  def set_user_assessment
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
  end
end
