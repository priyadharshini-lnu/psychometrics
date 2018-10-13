module Imports
  module External
    class MindMillImport < BaseExternalImport
      EXCLUDED_FIELDS = ['cmstudent'].freeze

      def normalize_data
        data = Hash.from_xml(raw_data_or_file).dig('Envelope', 'Body', 'SendResults2Response', 'SendResults2Result', 'results', 'applicant')
        normalize_nested_hash(data)
      end

      def excluded_fields
        EXCLUDED_FIELDS
      end
    end
  end
end
