# frozen_string_literal: true

module Api
  class V2::Administration::Reports::UploadsController < ActionController::Base
    include V2::Administration::Concerns::ApiController

    def update
      report.update!(report_params)
      head :no_content
    end

    def report
      @report ||= ::Pundit.policy_scope(current_user, [:api, :administration, Report]).find(params[:report_id])
    end

    def report_params
      params.permit(%i[poster icon remove_poster remove_icon])
    end
  end
end
