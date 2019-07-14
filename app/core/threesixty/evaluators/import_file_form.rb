# frozen_string_literal: true

module Threesixty
  module Evaluators
    class ImportFileForm < Rectify::Form
      attribute :file, ActionDispatch::Http::UploadedFile

      validates :file, file_content_type: { allow: ['text/csv'] }
    end
  end
end
