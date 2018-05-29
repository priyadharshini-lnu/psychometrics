module Hogan
  class AssignsController < ApplicationController
    before_action :set_assign
    append_before_action :pundit_authorize
    layout false

    def results
      report = Report.find(params[:report_id])
      hogan_credential = @current_membership.hogan_credential
      result = Services::Hogan::API::ParticipantReport.call(
        group: 'AllData',
        assessment_id: @assign.assessment.hogan_assessment_setting.hogan_assessment_id,
        report_id: report.hogan_report_setting.hogan_report_id,
        participant_id: hogan_credential.participant_id
      )

      if result.report.present?
        @assign.original_or_self.assigns_reports.find_by(report: report).
          update(external_report: "data:application/pdf;base64,#{result.report}")
        flash[:success] = t('.successfully')
      else
        flash[:error] = t('.not_completed')
      end

    rescue ActiveRecord::RecordNotFound
      flash[:error] = I18n.t('administration.noty.error_500')
    ensure
      redirect_to root_path
    end

    def redirect
      status = if params[:status] == 'Completed'
                 :completed
               elsif params[:status] == 'Pending'
                 :in_progress
               end

      @assign.update(status: status) if status
      redirect_to root_path
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
