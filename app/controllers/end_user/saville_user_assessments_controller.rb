# frozen_string_literal: true

class EndUser::SavilleUserAssessmentsController < ApplicationController
  before_action :set_user_assessment, only: %i[pass redirect]

  def pass
    campaign = @user_assessment.campaign
    return redirect_to(assessment_completed_path(campaign.id)) if @user_assessment.completed?

    @user_assessment.users_result.update!(started_at: Time.now) if @user_assessment.users_result.started_at.nil?
    @user_assessment.in_progress!
    saville_user_assessment = @user_assessment.saville_user_assessment
    return redirect_to(saville_user_assessment.url) if saville_user_assessment&.url

    ::Saville::AssessmentOrderRequest.call!(@user_assessment)

    redirect_to saville_user_assessment.url
  end

  def redirect
    campaign = @user_assessment.campaign
    if Saville::GetAssessmentStatus.call!(@user_assessment) == 'Completed'
      @user_assessment.update!(status: :completed, completed_at: Time.current)
    end

    redirect_to(assessment_completed_path(campaign.id))
  end

  private

  def set_user_assessment
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
  end
end
