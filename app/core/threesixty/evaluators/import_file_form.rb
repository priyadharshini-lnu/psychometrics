# frozen_string_literal: true

module Threesixty
  module Evaluators
    class ImportFileForm < Rectify::Form
      attribute :file, ActionDispatch::Http::UploadedFile

      validates :file, csv_file: true
    end
  end
end
