module Hogan
  class AssignsController < ApplicationController
    before_action :set_assign
    append_before_action :pundit_authorize
    layout false

    def results
      @report = Report.find(params[:report_id])

      result = get_participant_report
      if result.report.present?
        assigns_reports.find_each do |assigns_report|
          assigns_report.update(external_report: "data:application/pdf;base64,#{result.report}")
        end
        flash[:success] = t('.successfully')
      else
        flash[:error] = t('.not_completed')
      end

      without_score = assigns_reports.where(hogan_score: {})
      return if without_score.empty?

      result = get_participant_score
      if result.response.present?
        without_score.find_each do |assigns_report|
          assigns_report.update(hogan_score: result.response)
        end
      end
    rescue ActiveRecord::RecordNotFound
      flash[:error] = I18n.t('administration.noty.error_500')
    ensure
      redirect_to root_path
    end

    def redirect
      @assign.update(status: :completed, completed_at: Time.current) if params[:status] == 'Completed'

      redirect_to root_path
    end

    def pass
      @assign.in_progress!
      render json: :no_content
    end

    private

    def assigns_reports
      @assigns_reports ||=
        if @current_project.end_level?
          @assign.original_or_self.assigns_reports.where(report_id: @report.id)
        else
          AssignsReport.
            joins(assign: :project_assign).
            where(report_id: @report.id).
            where(assigns: { assessment_id: @assign.assessment.id }).
            where('project_assigns_assigns.id = ?', @assign.assign_with_result.id)
        end
    end

    def hogan_params
      @hogan_params ||= {
        hogan_group_name: @current_project.hogan_group_name,
        hogan_assessment_id: @assign.assessment.hogan_assessment_setting.hogan_assessment_id,
        hogan_report_id: @report.hogan_report_setting.hogan_report_id,
        hogan_norm_id: @report.hogan_report_setting.hogan_norm_id,
        hogan_participant_id: @current_membership.hogan_credential.participant_id
      }
    end

    def get_participant_report
      Services::Hogan::API::ParticipantReport.call(
        group: hogan_params[:hogan_group_name],
        assessment_id: hogan_params[:hogan_assessment_id],
        report_id: hogan_params[:hogan_report_id],
        participant_id: hogan_params[:hogan_participant_id]
      )
    end

    def get_participant_score
      Services::Hogan::API::ParticipantScore.call(
        group: hogan_params[:hogan_group_name],
        participant_id: hogan_params[:hogan_participant_id],
        assessment_id: hogan_params[:hogan_assessment_id],
        norm_id: hogan_params[:hogan_norm_id]
      )
    end

    def set_assign
      @assign = policy_scope(Assign).find(params[:id])
    end

    # Authorisation user
    def pundit_authorize
      authorize @assign || Assign
    end
  end
end
