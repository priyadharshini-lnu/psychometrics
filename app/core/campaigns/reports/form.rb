# frozen_string_literal: true

module Campaigns
  module Reports
    class Form < Rectify::Form
      attribute :report_family_id, Integer
      attribute :report_ids, Array
      attribute :report_access, { String => Boolean }
      attribute :operation, String, default: 'skip_existing'

      validates :report_family_id, presence: true
      validates :operation, inclusion: { in: %w[skip_existing add_with_existing_response add_and_allow_new_response] }

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

      def skip_existing?
        operation == 'skip_existing'
      end
    end
  end
end
