# frozen_string_literal: true

module AdminJobs
  class ImportDimensionFromJson < AdminJobs::Base
    def call
      data = record.data.with_indifferent_access
      errors = PortableData::Imports::Base.new(
        json_file_content: data['json_file_content'],
        mappable_values: data['mappable_values'],
        deleted_records: data['deleted_records']
      ).import!

      if errors
        raise StandardError, "Import failed: #{errors.join(', ')}"
      else
        broadcast :ok
      end
    end
  end
end
