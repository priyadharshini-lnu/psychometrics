# frozen_string_literal: true

class EndUser::HoganUserAssessmentsController < ApplicationController
  include AsyncRequestHandler

  before_action :set_user_assessment, only: %i[pass redirect]
  before_action :can_start_based_on_sequencing, only: %i[pass]

  async_request :pass, handler: ::Hogan::StartAssessment,
    permit_params: ->(params) { params.require(:hogan_user_assessment).permit(:id) }

  def redirect
    @user_assessment.update(status: :completed, completed_at: Time.current) if params[:status] == 'Completed'
    Hogan::HandleAssessmentCompletion.call!(@user_assessment)

    redirect_to(assessment_completed_path(@user_assessment.campaign, user_assessment_id: @user_assessment.id))
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
