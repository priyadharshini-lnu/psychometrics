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

    it 'validates ID column is present as the first header' do
      csv_content = "Name,Value\n1,Test"
      file = Tempfile.new(['test', '.csv'])
      file.write(csv_content)
      file.rewind

      uploaded_file = Rack::Test::UploadedFile.new(file.path, 'text/csv')
      form = described_class.new(file: uploaded_file)

      expect(form).not_to be_valid
      expect(form.errors[:base]).to include('Missing required columns: ID')
    end

    it 'validates at least one language column exists' do
      csv_content = "ID\n1"
      file = Tempfile.new(['test', '.csv'])
      file.write(csv_content)
      file.rewind

      uploaded_file = Rack::Test::UploadedFile.new(file.path, 'text/csv')
      form = described_class.new(file: uploaded_file)

      expect(form).not_to be_valid
      expect(form.errors[:base]).to include('Missing required columns: language columns')
    end

    it 'validates ID value format (should be number#field)' do
      csv_content = "ID,en\ninvalid,English"
      file = Tempfile.new(['test', '.csv'])
      file.write(csv_content)
      file.rewind

      uploaded_file = Rack::Test::UploadedFile.new(file.path, 'text/csv')
      form = described_class.new(file: uploaded_file)

      expect(form).not_to be_valid
      expect(form.errors[:base]).to include('Row 2: ID must be in the format "id#field"')
    end

    it 'validates ID part is a number' do
      csv_content = "ID,en\nabc#Name,English"
      file = Tempfile.new(['test', '.csv'])
      file.write(csv_content)
      file.rewind

      uploaded_file = Rack::Test::UploadedFile.new(file.path, 'text/csv')
      form = described_class.new(file: uploaded_file)

      expect(form).not_to be_valid
      expect(form.errors[:base]).to include('Row 2: ID must be a number')
    end

    it 'validates field part is either Name or Description' do
      csv_content = "ID,en\n1#InvalidField,English"
      file = Tempfile.new(['test', '.csv'])
      file.write(csv_content)
      file.rewind

      uploaded_file = Rack::Test::UploadedFile.new(file.path, 'text/csv')
      form = described_class.new(file: uploaded_file)

      expect(form).not_to be_valid
      expect(form.errors[:base]).to include('Row 2: Invalid field "InvalidField", must be "Name" or "Description"')
    end
  end
end
