# frozen_string_literal: true

module ClientAuditlogExportSettings
  module S3
    class BuildObject < BaseCommand
      DEFAULT_REGION = 'us-east-1'

      private_attr_reader :settings, :file_name

      def initialize(settings, file_name)
        @settings = settings
        @file_name = file_name
      end

      def call
        args = {
          credentials: Aws::Credentials.new(settings.s3_access_key_id, settings.s3_secret_access_key)
        }

        if settings.s3_compatible?
          args[:endpoint] = settings.s3_endpoint
          # TODO(atanych): it can be a problem for other s3_compatible services, but minio does not work w/o it
          args[:force_path_style] = true
          args[:region] = DEFAULT_REGION
        end

        if settings.s3?
          args[:region] = settings.s3_region
        end

        s3 = Aws::S3::Client.new(args)
        broadcast :ok, Aws::S3::Object.new(settings.s3_bucket_name, file_name, client: s3)
      end
    end
  end
end
