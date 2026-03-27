# frozen_string_literal: true

module Api
  class V2::Administration::Dimensions::InnovationStyles::UploadsController < ActionController::Base
    include V2::Administration::Concerns::ApiController

    def update
      innovation_style.update!(innovation_style_params)
      head :no_content
    end

    def innovation_style
      @innovation_style ||= ::Pundit.policy_scope(current_user, [:api, :administration, InnovationStyle]).
                            find(params[:innovation_style_id])
    end

    def innovation_style_params
      params.permit(%i[icon purge_icon])
    end
  end
end
