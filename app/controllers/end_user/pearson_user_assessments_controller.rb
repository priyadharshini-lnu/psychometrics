# frozen_string_literal: true

class EndUser::PearsonUserAssessmentsController < ApplicationController
  include AsyncRequestHandler

  before_action :set_user_assessment, only: %i[pass redirect]
  before_action :can_start_based_on_sequencing, only: %i[pass]

  async_request :pass, handler: ::Pearson::StartAssessment,
    permit_params: ->(params) { params.require(:pearson_user_assessment).permit(:id) }

  def redirect
    campaign = @user_assessment.campaign
    status = Pearson::GetScheduleStatus.call!(@user_assessment)
    if %w[Completed Has_Result].include?(status)
      @user_assessment.update!(status: :completed, completed_at: Time.current)
    end
    Pearson::SaveScoresAndReportsJob.perform_later(@user_assessment)

    redirect_to(assessment_completed_path(campaign.id, user_assessment_id: @user_assessment.id))
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
