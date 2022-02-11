# frozen_string_literal: true

class EndUser::IihtUserAssessmentsController < ApplicationController
  before_action :set_user_assessment, only: %i[pass redirect]

  def pass
    campaign = @user_assessment.campaign
    return redirect_to(assessment_completed_path(campaign.id)) if @user_assessment.completed?

    @user_assessment.users_result.update!(started_at: Time.now) if @user_assessment.users_result.started_at.nil?
    @user_assessment.in_progress!
    iiht_user_assessment = @user_assessment.iiht_user_assessment
    return redirect_to(iiht_user_assessment.url) if iiht_user_assessment&.url

    ::Iiht::AddAssessment.call!(@user_assessment)

    redirect_to iiht_user_assessment.url
  end

  private

  def set_user_assessment
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
  end
end
