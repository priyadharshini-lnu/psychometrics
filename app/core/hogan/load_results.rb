module Hogan
  class LoadResults < BaseCommand
    def initialize(assign, report, membership, project)
      @membership = membership
      @project = project
      @assign = assign
      @report = report
      @assigns_reports_scope = get_assigns_reports_scope

      # Hogan settings
      @hogan_group_name = project.hogan_group_name
      @hogan_assessment_id = assign.assessment.hogan_assessment_setting.hogan_assessment_id
      @hogan_report_id = report.hogan_report_setting.hogan_report_id
      @hogan_norm_id = report.hogan_report_setting.hogan_norm_id
      @hogan_participant_id = membership.hogan_credential.participant_id
    end

    def call
      participant_report = get_participant_report
      return broadcast(:not_completed) if participant_report.report.blank?

      # Sets loaded report
      assigns_reports_scope.update_all(external_report: "data:application/pdf;base64,#{participant_report.report}")

      # Fetchs score and sets to AssignsReports
      participant_score = get_participant_score
      if participant_score.response.present?
        assigns_reports_scope.where(hogan_score: {}).update_all(hogan_score: participant_score.response)
      end

      broadcast(:ok)
    end

    private

    attr_reader :assign, :report, :membership, :project, :hogan_group_name,
                :hogan_assessment_id, :hogan_report_id, :hogan_norm_id,
                :hogan_participant_id, :assigns_reports_scope

    # Loads report from Hogan
    #
    def get_participant_report
      Services::Hogan::API::ParticipantReport.call(
        group: hogan_group_name,
        assessment_id: hogan_assessment_id,
        report_id: hogan_report_id,
        participant_id: hogan_participant_id
      )
    end

    # Loads scores from Hogan
    #
    def get_participant_score
      Services::Hogan::API::ParticipantScore.call(
        group: hogan_group_name,
        participant_id: hogan_participant_id,
        assessment_id: hogan_assessment_id,
        norm_id: hogan_norm_id
      )
    end

    # Build scope for manipulate AssignsReports
    #
    def get_assigns_reports_scope
      if project.end_level?
        assign.original_or_self.assigns_reports.where(report_id: report.id)
      else
        AssignsReport.
          joins(assign: :project_assign).
          where(report_id: report.id).
          where(assigns: { assessment_id: assign.assessment.id }).
          where('project_assigns_assigns.id = ?', assign.assign_with_result.id)
      end
    end
  end
end
