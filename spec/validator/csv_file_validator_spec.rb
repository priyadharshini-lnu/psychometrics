# frozen_string_literal: true

require 'rails_helper'

class DummyCsvFileForm < Rectify::Form
  attribute :file, ActionDispatch::Http::UploadedFile

  validates :file, csv_file: true
end

describe CsvFileValidator do
  context 'validates csv file using mime type' do
    it 'valid file' do
      file = Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/test.csv'), 'text/csv')
      form = DummyCsvFileForm.new(file: file)
      form.validate

      expect(form.errors.messages[:file]).to_not include('File should be of type csv')
    end

    it 'invalid file' do
      file = Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/reports/test.pdf'), 'application/pdf')
      form = DummyCsvFileForm.new(file: file)
      form.validate

      expect(form.errors.messages[:file]).to include('File should be of type csv')
    end
  end

  context 'validates csv file extension' do
    it 'invalid file' do
      file = Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/reports/test.pdf'), 'text/csv')
      form = DummyCsvFileForm.new(file: file)
      form.validate

      expect(form.errors.messages[:file]).to include('File should be of type csv')
    end
  end
end
