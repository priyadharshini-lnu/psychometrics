# frozen_string_literal: true

class EndUser::SavilleUserAssessmentsController < ApplicationController
  before_action :set_user_assessment, only: %i[pass redirect]

  def pass
    campaign = @user_assessment.campaign
    return redirect_to(assessment_completed_path(campaign.id)) if @user_assessment.completed?

    saville_user_assessment = @user_assessment.saville_user_assessment
    return redirect_to(saville_user_assessment.url) if saville_user_assessment&.url

    ::Saville::AssessmentOrderRequest.call!(@user_assessment)
    @user_assessment.in_progress!

    redirect_to saville_user_assessment.url
  end

  def redirect
    campaign = @user_assessment.campaign
    @user_assessment.completed! if Saville::GetAssessmentStatus.call!(@user_assessment) == 'Completed'

    redirect_to(assessment_completed_path(campaign.id))
  end

  private

  def set_user_assessment
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
  end
end
