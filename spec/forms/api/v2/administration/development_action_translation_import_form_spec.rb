# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::DevelopmentActionTranslationImportForm do
  let(:valid_csv) do
    fixture_file_upload('development_action_translations.csv', 'text/csv')
  end

  let(:invalid_format_file) do
    fixture_file_upload('profile.png', 'image/png')
  end

  describe 'validations' do
    it 'is valid with proper CSV file' do
      form = described_class.new(file: valid_csv)
      expect(form).to be_valid
    end

    it 'is invalid without file' do
      form = described_class.new
      expect(form).not_to be_valid
      expect(form.errors[:file]).to include("can't be blank")
    end

    it 'is invalid with wrong file format' do
      form = described_class.new(file: invalid_format_file)
      expect(form).not_to be_valid
      expect(form.errors[:file]).to include('File must be a CSV file')
    end

    it 'validates required headers' do
      csv_content = "ID,Name\n1,Test"
      file = Tempfile.new(['test', '.csv'])
      file.write(csv_content)
      file.rewind

      uploaded_file = Rack::Test::UploadedFile.new(file.path, 'text/csv')
      form = described_class.new(file: uploaded_file)

      expect(form).not_to be_valid
      expect(form.errors[:base]).to include('Missing required columns: Locale, Description')
    end
  end

  describe '#processed_file' do
    it 'returns file when valid' do
      form = described_class.new(file: valid_csv)
      expect(form.processed_file).to eq(valid_csv)
    end

    it 'returns nil when invalid' do
      form = described_class.new(file: invalid_format_file)
      expect(form.processed_file).to be_nil
    end
  end
end
