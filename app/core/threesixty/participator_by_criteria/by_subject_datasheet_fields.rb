# frozen_string_literal: true

module Threesixty
  module ParticipatorByCriteria
    class BySubjectDatasheetFields < Base
      private

      def user_matches_criteria?(user, criteria)
        return false unless (subject_emails = evaluators_subjects[user.id])

        subject_emails.any? do |subject_email|
          if (datasheet_row = subject_datasheet_rows[subject_email])
            column = datasheet_row.sheet_columns.find_by(name: criteria['sub_field'])
            return false unless column

            row = datasheet_row.sheet_row_data.find_by(sheet_column_id: column.id)
            return false unless row

            row.value == criteria['value']
          end
        end
      end

      def subject_datasheet_rows
        subject_emails = evaluators_subjects.values.flatten
        @subject_datasheet_rows ||= threesixty_campaign.datasheet&.
                                    rows&.
                                    where(email: subject_emails)&.
                                    index_by(&:email) || {}
      end

      def evaluators_subjects
        @evaluators_subjects ||= threesixty_campaign.
                                 participants.
                                 actual_by_options(threesixty_campaign.option).
                                 where(evaluator_id: user_ids).
                                 joins('LEFT JOIN users ON users.id = user_assessments.subject_id').
                                 group(:evaluator_id).
                                 select('evaluator_id, array_agg(users.email) as subject_emails').
                                 each_with_object({}) do |participant, acc|
          acc[participant.evaluator_id] = participant.subject_emails
        end
      end
    end
  end
end
