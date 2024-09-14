# frozen_string_literal: true

module ObjectStorage
  class GetSingleSignedUploadUrl < BaseCommand
    private_attr_reader :model, :field, :file_name, :blob_params

    def initialize(model:, field:, blob_params:, file_name:, service_name: Settings.storage.private_storage_service)
      @model = model
      @field = field
      @blob_params = blob_params
      @file_name = file_name
      @service_name = service_name
    end

    def call
      asset_key = model.attachment_storage_path(field, file_name)

      blob = ActiveStorage::Blob.create_before_direct_upload!(
        key: asset_key,
        filename: blob_params['filename'] || file_name,
        byte_size: blob_params['byte_size'],
        checksum: blob_params['checksum'],
        content_type: blob_params['content_type'],
        service_name: @service_name
      )

      broadcast(:ok, direct_upload_json(blob, model.id))
    end

    private

    def direct_upload_json(blob, record_id)
      blob.as_json(root: false, methods: :signed_id).merge(
        url: blob.service_url_for_direct_upload,
        media_id: record_id
      ).merge(direct_upload: {
        url: blob.service_url_for_direct_upload,
        headers: blob.service_headers_for_direct_upload
      })
    end
  end
end
