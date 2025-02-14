# frozen_string_literal: true

module Api
  class V2::Administration::DevelopmentActions::UploadsController < ActionController::Base
    include V2::Administration::Concerns::ApiController

    before_action :set_resource

    def update
      if @development_action.update(development_action_params)
        head :no_content
      else
        render json: { errors: @development_action.errors }, status: :unprocessable_entity
      end
    end

    private

    def set_resource
      @development_action = ::Pundit.policy_scope(current_user, [:api, :administration, DevelopmentAction]).
                            find(params[:development_action_id])
    end

    def development_action_params
      params.permit(:image, :purge_image)
    end
  end
end
