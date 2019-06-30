# frozen_string_literal: true

module Threesixty
  module Subjects
    class Serialize < BaseCommand
      def initialize(subjects, threesixty_campaign)
        @subjects = subjects
        @threesixty_campaign = threesixty_campaign
      end

      def call
        counters = Threesixty::Participants::CalcCounters.call!(subjects.map(&:user_id), threesixty_campaign)
        subject_evaluator_counters = Threesixty::Subjects::CalcSubjectEvaluatorsCounters.call!(
          subjects.map(&:user_id),
          threesixty_campaign
        )
        datasheet_row_map = threesixty_campaign.datasheet&.rows.where(email: subjects.map { |s| s.user.email }).index_by(&:email)
        nomination_requirements = threesixty_campaign.nomination_requirements.order(:position)
        result = subjects.map do |subject|
          nomination_requirement = ::Threesixty::NominationRequirements::FindForSubject.call!(
            subject,
            threesixty_campaign,
            datasheet_row_map,
            nomination_requirements
          )
          ::Threesixty::SubjectSerializer.new(
            subject,
            option: threesixty_campaign.option,
            counters: counters,
            nomination_requirement: nomination_requirement,
            subject_evaluator_counters: subject_evaluator_counters
          ).to_h
        end
        broadcast :ok, result
      end

      private

      attr_reader :subjects, :threesixty_campaign
    end
  end
end
