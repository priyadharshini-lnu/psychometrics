# frozen_string_literal: true

class EndUser::YoodliUserAssessmentsController < ApplicationController
  include LtiLaunchHandler

  skip_before_action :verify_authenticity_token
  before_action :set_user_assessment, only: %i[pass]
  before_action :can_start_based_on_sequencing, only: %i[pass]

  lti_launch :pass, integration: :yoodli,
    permit_params: ->(params) { params.require(:yoodli_user_assessment).permit(:id) }

  private

  def can_start_based_on_sequencing
    return if UserAssessments::CanStartBasedOnSequencing.call!(@user_assessment)

    redirect_to campaign_path(@user_assessment.campaign_id)
  end

  def set_user_assessment
    @user_assessment = UserAssessment.find_by(id: params[:id], evaluator_id: current_user.id)
  end

  def meta_data
    return {} unless @user_assessment

    {
      user_assessment_id: @user_assessment.id
    }
  end
end
