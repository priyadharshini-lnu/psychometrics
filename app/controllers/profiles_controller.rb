class ProfilesController < ApplicationController
  before_action :set_profile, only: [:edit, :update]
  before_action :skip_policy_scope

  def update
    respond_to do |format|
      if @resource.update(profile_params)
        sign_in @resource, bypass: true
        format.js
      else
        format.js { render :edit }
      end
    end
  end

  private

  def set_profile
    @resource = current_user
  end

  def profile_params
    params.require(:resource).permit(:first_name, :last_name, :password)
  end
end
