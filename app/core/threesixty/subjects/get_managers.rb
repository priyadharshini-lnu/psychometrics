# frozen_string_literal: true

module Threesixty
  module Subjects
    class GetManagers < Rectify::Query
      def initailize(subject)
        @subject = subject
      end

      def query
        Threesixty::Evaluator.
          joins(participants: :relationship).
          where(campaign_id: subject.campaign_id, participants: { subject_id: subject.id, relationships: { name: 'Manager' } })
      end
    end
  end
end