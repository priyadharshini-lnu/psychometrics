# frozen_string_literal: true

class EndUser::IihtUserAssessmentsController < ApplicationController
  before_action :set_user_assessment, only: %i[pass]
  before_action :can_start_based_on_sequencing, only: %i[pass]

  def pass
    campaign = @user_assessment.campaign
    return redirect_to(assessment_completed_path(campaign.id)) if @user_assessment.completed?

    @user_assessment.update!(started_at: Time.zone.now) if @user_assessment.started_at.nil?
    @user_assessment.in_progress!
    iiht_user_assessment = @user_assessment.iiht_user_assessment
    return redirect_to(iiht_user_assessment.url) if iiht_user_assessment&.url

    ::Iiht::AddAssessment.call!(@user_assessment)

    redirect_to iiht_user_assessment.url
  end

  def redirect
    user_assessment = current_user.user_assessments.find_by!(
      campaign_id: params[:campaign_id], assessment_id: params[:assessment_id]
    )
    user_assessment.complete! unless user_assessment.completed?
    ::Iiht::SaveScoresJob.perform_later(user_assessment)

    redirect_to(assessment_completed_path(user_assessment.campaign_id))
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
