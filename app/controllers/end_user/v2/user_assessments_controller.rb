# frozen_string_literal: true

class EndUser::V2::UserAssessmentsController < ApplicationController
  include ::Threesixty::InitialState

  layout 'layouts/end_user'

  prepend_before_action :authenticate_anonymous_user!
  before_action :set_user_assessment, only: %i[assessment piped_text_data]
  before_action :ensure_campaign_user_is_active

  def assessment
    @selected_locale = @user_assessment.selected_locale || user_locale
    serialized = Assessments::CacheService.new(@user_assessment.assessment,
                                               @selected_locale, build_piped_context,
                                               @user_assessment.campaign_id).fetch_serialized_assessment
    render json: serialized
  end

  def piped_text_data
    piped_text_mapping = @user_assessment.assessment.generate_piped_text_mapping(build_piped_context)
    render json: piped_text_mapping
  end

  private

  def build_piped_context
    {
      evaluator: current_user,
      subject: current_user,
      threesixty_campaign: {},
      campaign: @user_assessment.campaign,
      result: @user_assessment.users_result,
      assessment: @user_assessment.assessment
    }
  end

  def set_user_assessment
    @user_assessment = UserAssessment.joins(:campaign).
                       find_by!(
                         id: params[:id],
                         evaluator_id: current_user.id,
                         campaigns: { status: :active }
                       )
    if request.format.html? && @user_assessment.closed?
      redirect_to assessment_completed_path(@user_assessment.campaign_id, user_assessment_id: @user_assessment.id)
    end
  end

  def ensure_campaign_user_is_active
    raise Pundit::NotAuthorizedError if @user_assessment.campaign_user.disabled
  end
end
