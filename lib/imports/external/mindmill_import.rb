module Imports
  module External
    class MindmillImport < BaseExternalImport
      EXCLUDED_FIELDS = %w(cmstudent cpiintro ed.memo nf.memo ti.memo cpi.memo oe.memo or.memo ab.memo rc.memo bands.memo wr.memo).freeze

      def normalize_data(raw_data_or_file, extra)
        # TODO (atanych): sort out that store xml as is (raw data) or normalize (like bellow)
        data = Hash.from_xml(raw_data_or_file).dig('Envelope', 'Body', 'SendResults2Response', 'SendResults2Result', 'results', 'applicant')
        normalize_nested_hash(data)
      end

      def excluded_fields
        EXCLUDED_FIELDS
      end
    end
  end
end
