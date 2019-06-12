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
        result = subjects.map do |subject|
          nomination_requirement = ::Threesixty::NominationRequirements::FindForSubject.call!(subject, threesixty_campaign)
          ::Threesixty::SubjectSerializer.new(
            subject,
            option: threesixty_campaign.option,
            counters: counters,
            nomination_requirement: nomination_requirement
          ).to_h
        end
        broadcast :ok, result
      end

      private

      attr_reader :subjects, :threesixty_campaign
    end
  end
end
