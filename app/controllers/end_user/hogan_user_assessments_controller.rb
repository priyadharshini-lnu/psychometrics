# frozen_string_literal: true

class EndUser::HoganUserAssessmentsController < ApplicationController
  before_action :set_user_assessment, only: %i[pass redirect]

  def redirect
    if params[:status] == 'Completed'
      @user_assessment.users_result.update(status: :completed, completed_at: Time.current)
    end

    Hogan::FetchResultsJob.set(wait: 30.seconds).
      perform_later(@user_assessment, current_user.hogan_credential, @user_assessment.campaign.project)

    user_result = @user_assessment.users_result
    UsersResults::GenerateReports.call(
      user_result,
      current_user,
      exceptUserReportIds: user_result.hogan_user_reports.pluck(:id)
    )

    redirect_to(campaign_path(@user_assessment.campaign))
  end

  def pass
    Hogan::StartAssessment.call(@user_assessment.users_result,
                                current_user.hogan_credential, @user_assessment.campaign.project)
    hogan_credential = HoganCredential.find_by(user_id: current_user.id)
    render json: ::EndUser::HoganCredentialSerializer.new(@user_assessment, current_user: current_user,
                                                         hogan_credential: hogan_credential, include: '**').to_h
  end

  private

  def set_user_assessment
    @user_assessment = UserAssessment.find_by!(id: params[:id], evaluator_id: current_user.id)
  end
end
