# frozen_string_literal: true

module Threesixty
  module Subjects
    class GetManagers < Rectify::Query
      private_attr_reader :subject

      def initialize(options)
        @subject = options[:subject]
      end

      def query
        Threesixty::Evaluator.
          joins(participants: :relationship).
          where(
            campaign_id: subject.campaign_id,
            user_assessments: { subject_id: subject.user_id },
            relationships: { name: 'Manager', type: Relationship.types[:global] }
          )
      end
    end
  end
end
