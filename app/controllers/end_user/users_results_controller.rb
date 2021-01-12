# frozen_string_literal: true

module EndUser
  class UsersResultsController < ApplicationController
    # append_before_action :pundit_authorize
    include UsersResults::ControllerConcern
    prepend_before_action :authenticate_anonymous_user!, only: %i[update upload_media_url
                                                                  remove_media update_meta_data
                                                                  complete_multipart_upload]
  end
end
