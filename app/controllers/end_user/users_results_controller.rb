# frozen_string_literal: true

module EndUser
  class UsersResultsController < ApplicationController
    # append_before_action :pundit_authorize
    include UsersResults::ControllerConcern
    prepend_before_action :authenticate_anonymous_user!, only: %i[update upload_media_url
                                                                  remove_media update_meta_data
                                                                  complete_multipart_upload]

    def index
      @user_assessment = UserAssessment.joins(:campaign).where.not(status: %i[completed timed_out ineligible]).
                         find_by!(
                           id: params[:user_assessment_id],
                           evaluator_id: current_user.id,
                           campaigns: { status: :active }
                         )
      @user_assessment.update(last_activity_at: DateTime.current)
      @selected_locale = @user_assessment.selected_locale || user_locale

      render json: @user_assessment.users_result, serializer: UsersResultSerializer,
             campaign: @user_assessment.campaign, participant: @user_assessment,
             current_user: current_user, locale: @selected_locale,
             piped_text_context: build_piped_context,
             include: '**'
    end

    def build_piped_context
      {
        evaluator: current_user,
        subject: current_user,
        threesixty_campaign: {},
        result: @user_assessment.users_result
      }
    end
  end
end
