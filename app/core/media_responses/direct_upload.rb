# frozen_string_literal: true

module MediaResponses
  class DirectUpload < BaseCommand
    private_attr_reader :question_id, :blob_params, :users_result, :file_name

    def initialize(question_id, blob_params, users_result, file_name = nil)
      @question_id = question_id
      @blob_params = blob_params
      @users_result = users_result
      @file_name = file_name
    end

    def call
      media = users_result.media_responses.find_or_create_by(question_id: question_id)

      project_id = users_result.campaign.project_id

      blob = ActiveStorage::Blob.create_before_direct_upload!(
        key: "private/projects/#{project_id}/media_response/#{media.users_result_id}/#{media.question_id}/#{media.id}/asset/#{file_name}", # rubocop:disable Layout/LineLength
        filename: blob_params['filename'] || file_name,
        byte_size: blob_params['byte_size'],
        checksum: blob_params['checksum'],
        content_type: blob_params['content_type'],
        service_name: Settings.storage.private_storage_service
      )

      broadcast(:ok, direct_upload_json(blob, media.id))
    end

    private

    def direct_upload_json(blob, media_id)
      blob.as_json(root: false, methods: :signed_id).merge(
        url: blob.service_url_for_direct_upload, media_id: media_id
      ).merge(direct_upload: {
        url: blob.service_url_for_direct_upload,
        headers: blob.service_headers_for_direct_upload
      })
    end
  end
end
