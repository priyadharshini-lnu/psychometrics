# frozen_string_literal: true

module Campaigns
  module UserReports
    class AddForm < Rectify::Form
      attribute :report_family_id, Integer
      attribute :report_ids, Array
      attribute :report_access, Hash[String => Boolean]
      attribute :operation, String, default: 'add_with_existing_response'

      validates :report_family_id, presence: true
      validates :operation, inclusion: { in: %w[add_with_existing_response add_and_allow_new_response] }

      def add_and_allow_new_response?
        operation == 'add_and_allow_new_response'
      end

      def assessments
        nil
      end

      def assessment_ids
        []
      end

      def assessment_map
        {}
      end

      def report_map
        {}
      end
    end
  end
end
