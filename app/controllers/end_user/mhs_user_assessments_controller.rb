# frozen_string_literal: true

class EndUser::MhsUserAssessmentsController < ApplicationController
  include AsyncRequestHandler

  before_action :set_user_assessment, only: %i[pass redirect]
  before_action :can_start_based_on_sequencing, only: %i[pass]

  async_request :pass, handler: ::Mhs::StartAssessment,
    permit_params: ->(params) { params.require(:mhs_user_assessment).permit(:id) }

  def redirect
    if @user_assessment
      campaign = @user_assessment&.campaign
      complete_user_assessment(@user_assessment)
      redirect_to assessment_completed_path(campaign.id, user_assessment_id: @user_assessment.id)
    else
      redirect_to root_path
    end
  end

  private

  def can_start_based_on_sequencing
    return if UserAssessments::CanStartBasedOnSequencing.call!(@user_assessment)

    redirect_to campaign_path(@user_assessment.campaign_id)
  end

  def complete_user_assessment(user_assessment)
    user_assessment.complete! unless user_assessment.completed?
  end

  def set_user_assessment
    @user_assessment = UserAssessment.find_by(id: params[:id], evaluator_id: current_user.id)
  end
end
