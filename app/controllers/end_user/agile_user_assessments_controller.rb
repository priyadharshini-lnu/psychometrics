# frozen_string_literal: true

class EndUser::AgileUserAssessmentsController < ApplicationController
  include ::Threesixty::InitialState
  include AgileUserResult

  prepend_before_action :authenticate_anonymous_user!
  before_action :set_user_result
  initial_state_for :show

  private

  def set_user_result
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
    @user_result = @user_assessment.users_result
  end

  def skip_authentication?
    @anonymous__user.present?
  end
end
