# frozen_string_literal: true

module Api
  class V2::Administration::Dimensions::Occupations::UploadsController < ActionController::Base
    include V2::Administration::Concerns::ApiController

    def update
      occupation.update!(occupation_params)
      head :no_content
    end

    def occupation
      @occupation ||= ::Pundit.policy_scope(current_user, [:api, :administration, Occupation]).
                      find(params[:occupation_id])
    end

    def occupation_params
      params.permit(%i[
        icon purge_icon
        alternative_icon purge_alternative_icon
        indicative_roles_image purge_indicative_roles_image
        key_career_tracks_image purge_key_career_tracks_image
      ])
    end
  end
end
