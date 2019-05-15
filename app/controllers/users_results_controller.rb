class UsersResultsController < ApplicationController
  # append_before_action :pundit_authorize
  skip_before_action :verify_authenticity_token

  def update
    users_result = UsersResult.find_by!(id: params[:id], evaluator_id: current_user.id)
    form = ::UsersResults::UpdatingForm.from_params(params.require(:resource))
    ::UsersResults::UpdateUsersResult.call(form, users_result, current_user)

    head :no_content
  end
end
