# frozen_string_literal: true

module Threesixty
  module ParticipatableByCriteria
    class BySubjectDatasheetFields < Base
      private

      def user_matches_criteria?(user)
        criteria_list.all? do |criteria|
          has_subject_matchin_datasheet_criteria?(user, criteria)
        end
      end

      def has_subject_matchin_datasheet_criteria?(user, criteria)
        return false unless subject_emails = evaluators_subjects[user.id]

        subject_emails.any? do |subject_email|
          if datasheet_row = subject_datasheet_rows[subject_email]
            datasheet_row.data[criteria['sub_field']] == criteria['value']
          end
        end
      end

      def subject_datasheet_rows
        subject_emails = evaluators_subjects.values.flatten
        @datasheet_row_data ||= threesixty_campaign.datasheet&.
          rows&.
          where(email: subject_emails)
          .index_by(&:email)
      end

      def evaluators_subjects
        @evaluators_subject ||= threesixty_campaign
          .participants.
          where(evaluator_id: user_ids).
          joins("LEFT JOIN users ON users.id = participants.subject_id").
          group(:evaluator_id).
          select('evaluator_id, array_agg(users.email) as subject_emails').
          each_with_object({}) do |participant, acc|
            acc[participant.evaluator_id] = participant.subject_emails
          end
      end
    end
  end
end
