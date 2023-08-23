# frozen_string_literal: true

module Api
  class V2::Administration::Users::UploadsController < ActionController::Base
    include V2::Administration::Concerns::ApiController

    before_action :set_resource

    def update
      @user.update!(photo: params[:photo])
      head :no_content
    end

    def set_resource
      @user = ::Pundit.policy_scope(current_user, [:api, :administration, User]).
              find(params[:user_id])
    end

    def user_params
      params.permit(%i[photo])
    end
  end
end
