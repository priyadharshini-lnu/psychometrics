# frozen_string_literal: true

module Threesixty
  module Subjects
    class GetManagers < Rectify::Query
      attr_reader :subject

      def initialize(subject)
        @subject = subject
      end

      def query
        Threesixty::Evaluator.
          joins(participants: :relationship).
          where(campaign_id: subject.campaign_id, participants: { subject_id: subject.user_id, relationships: { name: 'Manager' } })
      end
    end
  end
end