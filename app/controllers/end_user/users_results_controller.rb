# frozen_string_literal: true

module EndUser
  class UsersResultsController < ApplicationController
    # append_before_action :pundit_authorize
    include UsersResults::ControllerConcern

    prepend_before_action :authenticate_anonymous_user!,
                          only: %i[
                            index update upload_media_url remove_media update_meta_data complete_multipart_upload
                            upload_callback mark_as_user_selected_take
                          ]
    before_action :can_start_based_on_sequencing,
                  only: %i[update upload_media_url remove_media complete_multipart_upload]

    def index
      @user_assessment = UserAssessment.joins(:campaign).where.not(status: %i[completed timed_out ineligible]).
                         find_by!(
                           id: params[:user_assessment_id],
                           evaluator_id: current_user.id,
                           campaigns: { status: :active }
                         )
      @user_assessment.update(last_activity_at: DateTime.current)
      @selected_locale = @user_assessment.selected_locale || user_locale

      UserAssessments::Pass.call!(@user_assessment, @selected_locale) unless @user_assessment.started_at?
      render json: UsersResultSerializer.new(
        context: {
          campaign: @user_assessment.campaign,
          piped_text_context: build_piped_context,
          participant: @user_assessment, locale: @selected_locale,
          current_user: current_user,
          include: '**',
          generate_piped_text_mapping: @user_assessment.caching_enabled?
        }
      ).serialize(@user_assessment.users_result)
    end

    def build_piped_context
      {
        evaluator: current_user,
        subject: current_user,
        threesixty_campaign: {},
        campaign: @user_assessment.campaign,
        result: @user_assessment.users_result
      }
    end

    private

    def can_start_based_on_sequencing
      return if UserAssessments::CanStartBasedOnSequencing.call!(user_assessment)

      redirect_to campaign_path(user_assessment.campaign_id)
    end
  end
end
