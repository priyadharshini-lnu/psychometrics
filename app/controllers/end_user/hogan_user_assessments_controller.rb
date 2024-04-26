# frozen_string_literal: true

class EndUser::HoganUserAssessmentsController < ApplicationController
  before_action :set_user_assessment, only: %i[pass redirect]
  before_action :can_start_based_on_sequencing, only: %i[pass]

  def redirect
    @user_assessment.update(status: :completed, completed_at: Time.current) if params[:status] == 'Completed'
    Hogan::HandleAssessmentCompletion.call!(@user_assessment)

    redirect_to(assessment_completed_path(@user_assessment.campaign, user_assessment_id: @user_assessment.id))
  end

  def pass
    user_assessment = @user_assessment
    Hogan::StartAssessment.call(@user_assessment) do
      on(:ok) do
        hogan_credential = HoganCredential.find_by(user_id: current_user.id)
        render json: ::EndUser::HoganCredentialSerializer.new(context: {
          current_user: current_user,
          hogan_credential: hogan_credential, include: '**'
        }).
          serialize(user_assessment)
      end
      on(:invalid) do
        render(json: { error: '412' }, status: :precondition_failed)
      end
    end
  end

  private

  def can_start_based_on_sequencing
    return if UserAssessments::CanStartBasedOnSequencing.call!(@user_assessment)

    redirect_to campaign_path(@user_assessment.campaign_id)
  end

  def set_user_assessment
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
  end
end
