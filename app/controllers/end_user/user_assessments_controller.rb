# frozen_string_literal: true

class EndUser::UserAssessmentsController < ApplicationController
  include ::Threesixty::InitialState
  layout 'layouts/end_user'
  initial_state_for %i[pass]
  before_action :set_user_campaign, only: %i[assessment]

  def assessment
    @selected_locale = user_locale
    render json: @user_assessment.assessment,
           serializer: AssessmentSerializer,
           include: '**',
           selected_locale: @selected_locale,
           piped_text_context: build_piped_context
  end

  def pass
    respond_to do |format|
      format.html { render 'end_user/users/dashboard', layout: 'layouts/end_user' }
      format.json do
        # dummy for now
        # render json: @assign, serializer: AssignSerializer
      end
    end
  end

  private

  def build_piped_context
    {
      evaluator: current_user,
      subject: current_user,
      threesixty_campaign: {}
    }
  end

  def set_user_campaign
    @user_assessment = UserAssessment.find(params[:id])
  end
end
