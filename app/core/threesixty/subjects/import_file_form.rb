# frozen_string_literal: true

module Threesixty
  module Subjects
    class ImportFileForm < Rectify::Form
      attribute :file, ActionDispatch::Http::UploadedFile
      attribute :subjects, Array

      validates :file, file_content_type: { allow: ['text/csv'] }
    end
  end
end
