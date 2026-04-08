# frozen_string_literal: true

module Api
  class V2::Administration::Dimensions::Factors::UploadsController < ActionController::Base
    include V2::Administration::Concerns::ApiController

    def update
      factor.update!(factor_params)
      head :no_content
    end

    def factor
      @factor ||= ::Pundit.policy_scope(current_user, [:api, :administration, Factor]).find(params[:factor_id])
    end

    def factor_params
      params.permit(%i[icon purge_icon])
    end
  end
end
