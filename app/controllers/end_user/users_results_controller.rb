# frozen_string_literal: true

module EndUser
  class UsersResultsController < ApplicationController
    # append_before_action :pundit_authorize
    include UsersResults::ControllerConcern
    prepend_before_action :authenticate_anonymous_user!, only: %i[update upload_media_url
                                                                  remove_media update_meta_data
                                                                  complete_multipart_upload]
    before_action :can_start_based_on_sequencing,
                  only: %i[update upload_media_url remove_media complete_multipart_upload]

    private

    def can_start_based_on_sequencing
      return if UserAssessments::CanStartBasedOnSequencing.call!(user_assessment)

      redirect_to campaign_path(user_assessment.campaign_id)
    end
  end
end
