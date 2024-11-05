# frozen_string_literal: true

class EndUser::SimulationUserAssessmentsController < ApplicationController
  include AsyncRequestHandler

  before_action :set_user_assessment, only: %i[pass]
  before_action :can_start_based_on_sequencing, only: %i[pass]

  async_request :pass, handler: ::Simulation::StartAssessment,
    permit_params: ->(params) { params.require(:simulation_user_assessment).permit(:id) }

  def redirect
    user_assessment = find_user_assessment_from_request

    if user_assessment
      campaign = user_assessment&.campaign
      complete_user_assessment(user_assessment)
      redirect_to assessment_completed_path(campaign.id, user_assessment_id: user_assessment.id)
    else
      redirect_to root_path
    end
  end

  private

  def can_start_based_on_sequencing
    return if UserAssessments::CanStartBasedOnSequencing.call!(@user_assessment)

    redirect_to campaign_path(@user_assessment.campaign_id)
  end

  def set_user_assessment
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
  end

  def find_user_assessment_from_request
    token = params[:jwt_token]
    decoded_token = JWT.decode(token, Settings.secrets.webhook_jwt_secret, true, { algorithm: 'HS256' })
    user_assessment_id = decoded_token&.dig(0, 'data')

    UserAssessment.find_by(id: user_assessment_id) if user_assessment_id
  rescue JWT::DecodeError, JWT::ExpiredSignature => e
    Rails.logger.error("JWT Error: #{e.message}")
    nil
  end

  def complete_user_assessment(user_assessment)
    user_assessment.complete! unless user_assessment.completed?
  end
end
