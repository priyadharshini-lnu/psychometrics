# frozen_string_literal: true

module Api
  class V2::Administration::Assessments::UploadsController < ActionController::Base
    include V2::Administration::Concerns::ApiController

    before_action :set_resource

    def update
      @assessment.update!(assessment_params)
      head :no_content
    end

    def set_resource
      @assessment = ::Pundit.policy_scope(current_user,
                                          [:api, :administration, Assessment]).find(params[:assessment_id])
    end

    def assessment_params
      params.permit(%i[poster icon remove_poster remove_icon])
    end
  end
end
