# frozen_string_literal: true

class Assessors::UsersResultsController < Administration::BaseController
  skip_before_action :enforce_geo_restriction
  include UsersResults::ControllerConcern
  skip_after_action :verify_authorized, only: %i[upload_callback scoring]

  def set_user_result
    @users_result = UsersResult.joins(:user_assessment).
                    where(user_assessments: { evaluator_id: current_user.id }).
                    find(params[:id])
    authorize([:assessors, @users_result])
  end

  def scoring
    set_user_result
    @users_result.campaign.client.check_geo_restriction!
    @users_result.answers = params[:answers]
    render json: UsersResults::CalculateScoring.call!(@users_result)
  end
end
