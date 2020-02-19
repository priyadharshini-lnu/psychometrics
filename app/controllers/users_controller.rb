# frozen_string_literal: true

class UsersController < ApplicationController
  before_action :skip_policy_scope

  def update_details
    form = Users::ProfileForm.from_params(params[:user]).with_context(user: current_user)
    if form.valid?
      current_user.update!(form.attributes)
      render json: current_user, serializer: Threesixty::CurrentUserSerializer
    else
      render json: { errors: form.errors.messages }, status: :bad_request
    end
  end
end
