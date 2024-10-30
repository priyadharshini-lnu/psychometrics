# frozen_string_literal: true

module AdminJobs
  class ThreesixtyCampaignExportCompletionStatus < BaseExportCsv
    def valid?
      threesixty_campaign.present?
    end

    def generate_title_link
      {
        href: "/admin/clients/#{project.parent_id}/projects/#{project.id}/threesixty_campaigns/" \
              "#{threesixty_campaign.id}/participants/subjects",
        label: threesixty_campaign.name
      }
    end

    def generate_details
      [[I18n.t('administration.clients.threesixty_campaign'), file_link || threesixty_campaign.name]]
    end

    private

    def records_for_export
      @records_for_export ||= threesixty_campaign.participants.actual_by_options(option).
                              select(
                                'user_assessments.*',
                                'users_results.id as result_id',
                                'users_results.created_at as created_at'
                              ).
                              left_joins(:users_result).
                              includes(:subject, :evaluator, :relationship)
    end

    def record_count
      @record_count ||= records_for_export.length
    end

    def headers
      headers = default_headers
      headers << 'Nomination Approval Status' if manager_can_approve_nominations?
      headers << 'Report Approval Status' if manager_or_admin_can_approve_reports?
      headers << 'Evaluation Approval Status' if manager_can_approve_evaluations?
      headers
    end

    def default_headers
      [
        'Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email', 'RelationShip',
        'Started At', 'Completed At', 'Evaluator Nomination Status', 'Report Status', 'Report Release Status',
        'Subject Status', 'Evaluation Status'
      ]
    end

    def data_row(participant)
      row = [
        participant.result_id && UsersResult.encode_id(participant.result_id),
        participant.subject&.decorate&.full_name,
        participant.subject&.email,
        participant.evaluator.decorate.full_name,
        participant.evaluator.email,
        participant.relationship.name,
        participant.created_at.to_s,
        participant.completed_at.to_s,
        I18n.t("user_assessments.statuses.evaluator_nomination_status.#{participant.evaluator_nomination_status}"),
        I18n.t("subjects.report_statuses.#{report_status(participant.threesixty_subject)}"),
        I18n.t("subjects.report_release_status.#{participant.threesixty_subject.report_release_status}"),
        I18n.t("subjects.statuses.#{subject_status(participant.threesixty_subject)}"),
        I18n.t("user_assessments.status.#{participant.status}")
      ]
      row << manager_nomination_status(participant) if manager_can_approve_nominations?
      row << report_approval_status(participant) if manager_or_admin_can_approve_reports?
      row << evaluation_approval_status(participant) if manager_can_approve_evaluations?
      row
    end

    def file_name
      "completion_status_export_campaign_#{threesixty_campaign.id}.csv"
    end

    def option
      @option ||= threesixty_campaign.option
    end

    def report_status(subject)
      Threesixty::Participants::GetReportStatus.call!(
        subject,
        option,
        subject_evaluator_counters&.dig(subject.user_id, :completed) || {}
      )
    end

    def subject_status(subject)
      Threesixty::Participants::GetStatus.call!(
        subject,
        nomination_requirement_by_user_id[subject.user_id],
        participant_calculated_counters[subject.user_id],
        subject_evaluator_counters&.dig(subject.user_id, :all) || {}
      )
    end

    def manager_or_admin_can_approve_reports?
      return @manager_or_admin_can_approve_reports if defined?(@manager_or_admin_can_approve_reports)

      @manager_or_admin_can_approve_reports ||= option.reports.dig(
        'approval', 'administrator_approves_reports'
      ) || option.reports.dig('approval', 'manager_approves_reports')
    end

    def manager_can_approve_nominations?
      return @manager_can_approve_nominations if defined?(@manager_can_approve_nominations)

      @manager_can_approve_nominations = option.participants.dig('manager', 'can_approve_nominations')
    end

    def manager_can_approve_evaluations?
      return @manager_can_approve_evaluations if defined?(@manager_can_approve_evaluations)

      @manager_can_approve_evaluations = option.participants.dig('manager', 'can_approves_evaluations')
    end

    def nomination_requirement_by_user_id
      @nomination_requirement_by_user_id ||= ::Threesixty::NominationRequirements::FindForUsers.call!(
        threesixty_campaign.subjects,
        threesixty_campaign
      )
    end

    def participant_calculated_counters
      @participant_calculated_counters ||= Threesixty::Participants::CalcCounters.call!(
        subject_user_ids, threesixty_campaign
      )
    end

    def subject_evaluator_counters
      @subject_evaluator_counters ||= Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
        subject_user_ids,
        threesixty_campaign
      )
    end

    def subject_user_ids
      @subject_user_ids ||= threesixty_campaign.subjects.pluck(:user_id)
    end

    def manager_nomination_status(participant)
      I18n.t("user_assessments.statuses.manager_nomination_status.#{participant.manager_nomination_status}")
    end

    def report_approval_status(participant)
      I18n.t("subjects.report_approval_status.#{participant.threesixty_subject.report_approval_status}")
    end

    def evaluation_approval_status(participant)
      I18n.t("user_assessments.statuses.manager_evaluation_status.#{participant.manager_evaluation_status}")
    end

    def threesixty_campaign
      @threesixty_campaign ||= Threesixty::Campaign.find_by(id: record.data['threesixty_campaign_id'])
    end

    def project
      @project ||= threesixty_campaign.campaign.project
    end
  end
end
