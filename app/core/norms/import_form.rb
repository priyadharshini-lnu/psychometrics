# frozen_string_literal: true

module Norms
  class ImportForm < Rectify::Form
    attribute :file, File
    attribute :owner_id, Integer

    validates :file, presence: true
    validates :file,
              file_size: { less_than_or_equal_to: 4.megabytes },
              file_content_type: { allow: ['text/csv', 'text/plain'] },
              if: -> { file.is_a?(ActionDispatch::Http::UploadedFile) || file.is_a?(Rack::Test::UploadedFile) }
  end
end
