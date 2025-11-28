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
    error_message = nil

    if %w[Completed Has_Result].include?(status)
      @user_assessment.update!(status: :completed, completed_at: Time.current)
    elsif %w[Error In_Progress].include?(status)
      set_user_assessment_status_to_timed_out
      error_message = timed_out_error_message
    end

    Pearson::SaveScoresAndReportsJob.perform_later(@user_assessment)

    redirect_to(
      assessment_completed_path(campaign.id, user_assessment_id: @user_assessment.id),
      error: error_message
    )
  end

  private

  def timed_out_error_message
    I18n.t('errors.assessments.timed_out', assessment_name: @user_assessment.assessment.name)
  end

  def set_user_assessment_status_to_timed_out
    @user_assessment.update!(
      status: :timed_out,
      completion_reason: :time_out_offline
    )
  end

  def can_start_based_on_sequencing
    return if UserAssessments::CanStartBasedOnSequencing.call!(@user_assessment)

    redirect_to campaign_path(@user_assessment.campaign_id)
  end

  def set_user_assessment
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
  end
end
