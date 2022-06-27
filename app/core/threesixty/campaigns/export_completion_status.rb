# frozen_string_literal: true

module Threesixty
  module Campaigns
    class ExportCompletionStatus < BaseCommand
      private_attr_reader :threesixty_campaign, :option, :subject_user_ids

      def initialize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
        @option = threesixty_campaign.option
        @subject_user_ids = threesixty_campaign.subjects.pluck(:user_id)
      end

      def call
        main_package = Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'CompletionStatus') do |sheet|
            header_style = package.workbook.styles.add_style(b: true, sz: 14)
            headers = default_headers
            headers << 'Nomination Approval Status' if manager_can_approve_nominations?
            headers << 'Report Approval Status' if manager_or_admin_can_approve_reports?
            headers << 'Evaluation Approval Status' if manager_can_approve_evaluations?
            sheet.add_row(headers, style: header_style)
            # RTOD: Check this
            participants = threesixty_campaign.participants.actual_by_options(option).
                           select(
                             'user_assessments.*',
                             'users_results.id as result_id',
                             'users_results.created_at as created_at'
                           ).
                           left_joins(:users_result).
                           includes(:subject, :evaluator, :relationship)
            participants.each do |participant|
              row_data = default_row_data(participant)
              row_data << manager_nomination_status(participant) if manager_can_approve_nominations?
              row_data << report_approval_status(participant) if manager_or_admin_can_approve_reports?
              row_data << evaluation_approval_status(participant) if manager_can_approve_evaluations?
              sheet.add_row row_data
            end
          end
        end
        broadcast :ok, main_package
      end

      def default_headers
        [
          'Result ID', 'Subject Name', 'Subject Email', 'Evaluator Name', 'Evaluator Email', 'RelationShip',
          'Started At', 'Completed At', 'Evaluator Nomination Status', 'Report Status', 'Report Release Status',
          'Subject Status', 'Evaluation Status'
        ]
      end

      def default_row_data(participant)
        [
          participant.result_id && UsersResult.encode_id(participant.result_id),
          participant.subject&.decorate&.full_name,
          participant.subject&.email,
          participant.evaluator.decorate.full_name,
          participant.evaluator.email,
          participant.relationship.name,
          participant.created_at.try(:strftime, '%D %r'),
          participant.completed_at.try(:strftime, '%D %r'),
          I18n.t("user_assessments.statuses.evaluator_nomination_status.#{participant.evaluator_nomination_status}"),
          I18n.t("subjects.report_statuses.#{report_status(participant.threesixty_subject)}"),
          I18n.t("subjects.report_release_status.#{participant.threesixty_subject.report_release_status}"),
          I18n.t("subjects.statuses.#{subject_status(participant.threesixty_subject)}"),
          I18n.t("user_assessments.status.#{participant.status}")
        ]
      end

      private

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

      def manager_nomination_status(participant)
        I18n.t("user_assessments.statuses.manager_nomination_status.#{participant.manager_nomination_status}")
      end

      def report_approval_status(participant)
        I18n.t("subjects.report_approval_status.#{participant.threesixty_subject.report_approval_status}")
      end

      def evaluation_approval_status(participant)
        I18n.t("user_assessments.statuses.manager_evaluation_status.#{participant.manager_evaluation_status}")
      end
    end
  end
end
