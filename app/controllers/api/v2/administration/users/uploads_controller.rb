# frozen_string_literal: true

module Api
  class V2::Administration::Users::UploadsController < ActionController::Base
    include V2::Administration::Concerns::ApiController

    def update
      current_user.user_profile.update!(photo: params[:photo])
      head :no_content
    end
  end
end
