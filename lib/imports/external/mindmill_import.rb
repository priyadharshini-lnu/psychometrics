# frozen_string_literal: true

module Imports
  module External
    class MindmillImport < BaseExternalImport
      EXCLUDED_FIELDS = %w[cmstudent cpiintro ed.memo nf.memo ti.memo cpi.memo oe.memo or.memo ab.memo rc.memo bands.memo wr.memo].freeze

      def normalize_data(data, _extra)
        normalize_nested_hash(data.dig(:results, :applicant))
      end

      def excluded_fields
        EXCLUDED_FIELDS
      end
    end
  end
end
