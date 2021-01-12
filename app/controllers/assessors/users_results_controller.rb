# frozen_string_literal: true

class Assessors::UsersResultsController < Administration::BaseController
  include UsersResults::ControllerConcern

  def set_user_result
    @users_result = UsersResult.find_by!(id: params[:id], evaluator_id: current_user.id)
    authorize([:assessors, @users_result])
  end
end
