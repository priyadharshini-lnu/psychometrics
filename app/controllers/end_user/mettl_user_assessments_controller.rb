# frozen_string_literal: true

class EndUser::MettlUserAssessmentsController < ApplicationController
  include AsyncRequestHandler

  before_action :set_user_assessment, only: %i[pass]
  before_action :can_start_based_on_sequencing, only: %i[pass]
  before_action :set_user_assessment_id_in_session, only: %i[pass]

  async_request :pass, handler: ::Mettl::StartAssessment,
    permit_params: ->(params) { params.require(:mettl_user_assessment).permit(:id) }

  def redirect
    user_assessment = find_user_assessment_from_session

    if user_assessment
      campaign = user_assessment&.campaign
      complete_user_assessment(user_assessment)
      clear_user_assessment_from_session
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

  def set_user_assessment_id_in_session
    mettl_assessment = MettlAssessment.find_by(product_id: @user_assessment.assessment.external_assessment_id)
    session[:in_progress_mettl_assessment_details] = {
      mettl_assessment_id: mettl_assessment.id, user_assessment_id: @user_assessment.id
    }
  end

  def set_user_assessment
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
  end

  def find_user_assessment_from_session
    mettl_assessment_id = params[:mettl_assessment_id].to_i
    session_details = session[:in_progress_mettl_assessment_details]

    if session_details && session_details['mettl_assessment_id'].to_i == mettl_assessment_id
      user_assessment_id = session_details['user_assessment_id']
      UserAssessment.find_by(id: user_assessment_id)
    end
  end

  def complete_user_assessment(user_assessment)
    user_assessment.complete! unless user_assessment.completed?
  end

  def clear_user_assessment_from_session
    session.delete(:in_progress_mettl_assessment_details)
  end
end
