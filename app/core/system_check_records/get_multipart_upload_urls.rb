# frozen_string_literal: true

module SystemCheckRecords
  class GetMultipartUploadUrls < BaseCommand
    private_attr_reader :system_check_record, :file_name, :duration

    def initialize(system_check_record, file_name, duration: 0)
      @system_check_record = system_check_record
      @file_name = file_name
      @duration = duration
    end

    def call
      urls = []
      signer = Aws::S3::Presigner.new
      key = system_check_record.attachment_storage_path(:media, file_name)

      multipart_request = Aws::S3::Client.new.create_multipart_upload(
        bucket: Settings.secrets.s3_compatible_storage[:private_bucket],
        key: key
      )

      number_of_urls.times do |time|
        part_number = (time + 1).to_s
        url = signer.presigned_url(
          :upload_part,
          bucket: Settings.secrets.s3_compatible_storage[:private_bucket],
          key: key,
          upload_id: multipart_request.upload_id,
          part_number: part_number,
          expires_in: 1800,
          use_accelerate_endpoint: Settings.aws.s3.accelerated
        )
        urls << url
      end

      broadcast(:ok, {
        system_check_record_id: system_check_record.id,
        asset_key: key,
        upload_id: multipart_request.upload_id,
        urls: urls
      })
    end

    private

    def number_of_urls
      (duration / 10.0).ceil
    end
  end
end
