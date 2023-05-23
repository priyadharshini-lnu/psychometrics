# frozen_string_literal: true

module Api
  class V2::Administration::DesignSettings::UploadsController < ActionController::Base
    include V2::Administration::Concerns::ApiController

    before_action :set_resource

    def update
      @settings.update!(design_params)
      head :no_content
    end

    def set_resource
      @settings = ::Pundit.policy_scope(current_user, [:api, :administration, DesignSetting]).
                  find(params[:design_setting_id])
    end

    def design_params
      params.permit(%i[logo background secondary_logo remove_logo remove_background remove_secondary_logo])
    end
  end
end
