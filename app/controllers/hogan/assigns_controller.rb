# frozen_string_literal: true

module Hogan
  class AssignsController < ApplicationController
    before_action :set_assign
    append_before_action :pundit_authorize
    layout false

    def results
      @report = Report.find(params[:report_id])

      Hogan::LoadResults.call(@assign, @report, @current_membership.membership_with_result, @current_project) do
        on(:not_completed) { flash[:error] = t('.not_completed') }
        on(:ok) { flash[:success] = t('.successfully') }
      end
    rescue ActiveRecord::RecordNotFound
      flash[:error] = I18n.t('administration.noty.error_500')
    ensure
      redirect_to root_path
    end

    def redirect
      @assign.update(status: :completed, completed_at: Time.current) if params[:status] == 'Completed'

      Hogan::LoadResultsJob.set(wait: 30.seconds).
        perform_later(@assign, @current_membership.membership_with_result, @current_project)

      redirect_to root_path
    end

    def pass
      Hogan::PassAssessment.call(@assign, @current_membership.membership_with_result, @current_project) do
        on(:ok)      do
          respond_to do |format|
            format.html { render(:pass) }
            format.json do
              hogan_params = {
                url: Rails.application.secrets.hogan[:login_url],
                user_id: current_user.current_membership.hogan_credential&.participant_id,
                password: current_user.current_membership.hogan_credential&.password,
                unique_id: current_user.email,
                first_name: current_user.first_name,
                last_name: current_user.last_name,
                language_id: 'en',
                direct_assessment_id: @assign.assessment.hogan_assessment_setting.hogan_assessment_id,
                display_informed_consent: 'YES',
                return_url: redirect_hogan_assign_url(@assign, email: 'CandID',
                                participant_id: 'HASUserID', status: 'AssessmentStatus',
                                assessment_id: 'AssessmentID')
              }
              render json: hogan_params
            end
          end
        end
        on(:invalid) { render(:error, locals: { message: t('errors.error_500') }) }
      end
    end

    private

    def set_assign
      @assign = policy_scope(Assign).find(params[:id])
    end

    # Authorisation user
    def pundit_authorize
      authorize @assign || Assign
    end
  end
end
