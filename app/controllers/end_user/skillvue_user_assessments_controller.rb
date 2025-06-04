# frozen_string_literal: true

class EndUser::SkillvueUserAssessmentsController < ApplicationController
  include AsyncRequestHandler

  before_action :set_user_assessment, only: %i[pass]
  before_action :can_start_based_on_sequencing, only: %i[pass]

  async_request :pass, handler: ::Skillvue::StartAssessment,
    permit_params: ->(params) { params.require(:skillvue_user_assessment).permit(:id) }

  private

  def can_start_based_on_sequencing
    return if UserAssessments::CanStartBasedOnSequencing.call!(@user_assessment)

    redirect_to campaign_path(@user_assessment.campaign_id)
  end

  def set_user_assessment
    @user_assessment = UserAssessment.find_by(id: params[:id], evaluator_id: current_user.id)
  end
end
