# frozen_string_literal: true

module AdminJobs
  class ImportNormJob < AdminJobs::Base
    def call
      rows = process_csv_file(record.file)
      result = Norms::ImportNorm.call(
        rows, record.data['owner_id'], owner
      )
      if result.success?
        broadcast :ok
      else
        broadcast :error, result.error
      end
    end

    def process_csv_file(file)
      if file.is_a?(ActionDispatch::Http::UploadedFile) || file.is_a?(Rack::Test::UploadedFile)
        CSV.read(file.path, encoding: 'bom|utf-8')
      else
        CSV.new(URI(file.url).open, headers: true).read
      end
    end
  end
end
