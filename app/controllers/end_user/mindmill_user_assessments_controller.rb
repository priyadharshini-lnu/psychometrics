# frozen_string_literal: true

class EndUser::MindmillUserAssessmentsController < ApplicationController
  before_action :set_user_assessment, only: %i[pass redirect]

  def pass
    campaign = @user_assessment.campaign
    return redirect_to(campaign_path(campaign)) if @user_assessment.completed?

    user_result = @user_assessment.users_result

    sso_url = ::Mindmill::GetSsoUrl.call!(user_result, user_locale)

    if sso_url
      sso_url = "#{sso_url}&URL=#{request.base_url}#{redirect_mindmill_user_assessment_path(params[:id])}"
      user_result.in_progress!
      return redirect_to(sso_url, allow_other_host: true)
    end

    redirect_to(campaign_path(campaign))
  end

  def redirect
    campaign = @user_assessment.campaign
    unless @user_assessment.completed?
      ::Mindmill::LoadResultsJob.perform_now(@user_assessment.users_result, current_user)
    end

    redirect_to(campaign_path(campaign))
  end

  private

  def set_user_assessment
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
  end
end
