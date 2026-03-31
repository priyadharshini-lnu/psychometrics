# frozen_string_literal: true

class Api::V2::Administration::DirectUploadResource < Api::V2::Administration::BaseResource
  model_name 'TemporaryUpload'

  attributes :file_key, :filename, :content_type, :byte_size, :status
end
