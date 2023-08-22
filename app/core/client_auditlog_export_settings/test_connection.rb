# frozen_string_literal: true

module ClientAuditlogExportSettings
  class TestConnection < BaseCommand
    TEST_DATA = '{"id":"test","action":"test"}'

    private_attr_reader :settings

    def initialize(settings)
      @settings = settings
    end

    def call
      file_name = BuildExportFileName.call!(settings, settings.client, Time.current)
      object = ClientAuditlogExportSettings::S3::BuildObject.call!(settings, file_name)
      upload(object)
      # There is risk to face more errors, but I don't want to catch everything and treat that as AWS conn issue
      broadcast :ok
    rescue Aws::Errors::ServiceError, Aws::Errors::NoSuchEndpointError, ArgumentError => e
      Rails.logger.error("TestConnection #{e.inspect}")
      broadcast :error, :invalid_aws_connection
    end

    def upload(object)
      tempfile = Tempfile.new('temp')
      tempfile.write(TEST_DATA)
      tempfile.rewind

      object.upload_file(tempfile.path)

      tempfile.close
      tempfile.unlink
    end
  end
end
