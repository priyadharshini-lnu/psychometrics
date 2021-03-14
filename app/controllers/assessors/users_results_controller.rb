# frozen_string_literal: true

class Assessors::UsersResultsController < Administration::BaseController
  include UsersResults::ControllerConcern
  skip_after_action :verify_authorized, only: [:upload_callback]

  def set_user_result
    @users_result = UsersResult.joins(:user_assessment).
                    where(user_assessments: { evaluator_id: current_user.id }).
                    find(params[:id])
    authorize([:assessors, @users_result])
  end
end
