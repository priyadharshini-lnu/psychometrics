# frozen_string_literal: true

module Api
  class V2::Administration::DirectUploadsController < Api::V2::Administration::BaseController
    skip_before_action :enforce_geo_restriction
    skip_before_action :jsonapi_request_handling, only: [:create]
    skip_before_action :setup_custom_request, :validate_request_schema, raise: false

    def create
      bucket = Settings.secrets.s3_compatible_storage[:public_bucket]
      service_name = Settings.secrets.s3_compatible_storage[:provider]

      uploads = direct_upload_params[:files].map do |file_params|
        build_upload_payload(file_params, bucket, service_name)
      end

      render json: uploads, status: :created
    end

    private

    def build_upload_payload(file_params, bucket, service_name)
      filename = file_params.require(:filename)
      content_type = file_params.require(:content_type)
      byte_size = file_params.require(:byte_size).to_i
      file_key = "#{Settings.aws.s3.temporary_upload_folder}/#{SecureRandom.uuid}/#{filename}"

      post = Aws::S3::Bucket.new(bucket).presigned_post(
        key: file_key,
        content_type: content_type,
        expires: 15.minutes.from_now,
        content_length_range: 1..TemporaryUpload::MAX_FILE_SIZE
      )

      temporary_upload = current_user.temporary_uploads.create!(
        file_key: file_key,
        filename: filename,
        content_type: content_type,
        byte_size: byte_size,
        checksum: file_params[:checksum],
        service_name: service_name,
        bucket: bucket,
        status: :pending
      )

      {
        presigned_url: post.url,
        presigned_fields: post.fields,
        file_key: file_key,
        temporary_upload_id: temporary_upload.id
      }
    end

    def direct_upload_params
      params.permit(files: %i[filename content_type byte_size checksum])
    end
  end
end
