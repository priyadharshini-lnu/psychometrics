# frozen_string_literal: true

module Threesixty
  module Subjects
    class ImportFileForm < Rectify::Form
      attribute :file, ActionDispatch::Http::UploadedFile
      attribute :subjects, Array

      validates :file, csv_file: true
    end
  end
end
