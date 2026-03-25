# frozen_string_literal: true

class EndUser::AgileUserAssessmentsController < ApplicationController
  include ::Threesixty::InitialState
  include AgileUserResult

  prepend_before_action :set_fullscreen_permissions_policy
  prepend_before_action :authenticate_anonymous_user!
  before_action :set_user_result
  before_action :can_start_based_on_sequencing, only: %i[show update events]
  initial_state_for :show

  private

  def set_fullscreen_permissions_policy
    response.set_header('Permissions-Policy', 'fullscreen=(self)')
  end

  def can_start_based_on_sequencing
    return if UserAssessments::CanStartBasedOnSequencing.call!(@user_assessment)

    redirect_to campaign_path(@user_assessment.campaign_id)
  end

  def set_user_result
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
    @user_result = @user_assessment.users_result
  end

  def skip_authentication?
    @anonymous__user.present?
  end

  def campaign_intial_state
    {
      campaign: {
        id: @user_assessment.campaign_id
      }
    }
  end
end
