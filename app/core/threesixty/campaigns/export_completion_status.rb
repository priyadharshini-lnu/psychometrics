# frozen_string_literal: true

module Threesixty
  module Campaigns
    class ExportCompletionStatus < BaseCommand
      def initialize(threesixty_campaign)
        @threesixty_campaign = threesixty_campaign
      end

      def call
        main_package = Axlsx::Package.new do |package|
          package.workbook.add_worksheet(name: 'CompletionStatus') do |sheet|
            header_style = package.workbook.styles.add_style(b: true, sz: 14)
            header = [
              'Result ID',
              'Subject Name',
              'Subject Email',
              'Evaluator Name',
              'Evaluator Email',
              'RelationShip',
              'Started At',
              'Completed At',
              'Status'
            ]
            sheet.add_row(header, style: header_style)
            participants = threesixty_campaign.participants.actual_by_options(threesixty_campaign.option).
              select(
                'threesixty_participants.*',
                'users_results.status as result_status',
                'users_results.id as result_id',
                'users_results.created_at as result_created_at',
                'users_results.completed_at as result_completed_at'
                ).
              joins('LEFT JOIN users_results on users_results.subject_id = threesixty_participants.subject_id and users_results.evaluator_id = threesixty_participants.evaluator_id').
              includes(:subject, :evaluator, :relationship)
            participants.each do |participant|
              sheet.add_row [participant.result_id && UsersResult.encode_id(participant.result_id),
                             participant.subject&.decorate&.full_name,
                             participant.subject&.email,
                             participant.evaluator.decorate.full_name,
                             participant.evaluator.email,
                             participant.relationship.name,
                             participant.result_created_at.try(:strftime, '%D %r'),
                             participant.result_completed_at.try(:strftime, '%D %r'),
                             I18n.t("administration.clients.projects.threesixty_campaigns.completion_statuses.#{get_status(participant)}")]
            end
          end
        end
        broadcast :ok, main_package
      end

      def get_status(participant)
        return :not_started if participant.result_status == 0 || !participant.result_status
        return :in_progress if participant.result_status == 1
        return :approved if participant.result_status == 2 && participant.manager_evaluation_approved?
        return :denied if participant.result_status == 2 && participant.manager_evaluation_denied?
        return :completed if participant.result_status == 2
      end

      private

      attr_reader :threesixty_campaign
    end
  end
end
