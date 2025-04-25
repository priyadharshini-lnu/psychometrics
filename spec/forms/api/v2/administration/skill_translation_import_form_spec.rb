# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::SkillTranslationImportForm do
  let(:valid_csv_content) do
    <<~CSV
      ID,Locale,Name,Description
      1,en,Test Skill,Test Description
    CSV
  end

  let(:invalid_csv_content) do
    <<~CSV
      ID,Name,Description
      1,Test Skill,Test Description
    CSV
  end

  let(:invalid_locale_content) do
    <<~CSV
      ID,Locale,Name,Description
      1,xx,Test Skill,Test Description
    CSV
  end

  let(:valid_file) do
    Rack::Test::UploadedFile.new(
      StringIO.new(valid_csv_content),
      'text/csv',
      original_filename: 'valid.csv'
    )
  end

  let(:invalid_file) do
    Rack::Test::UploadedFile.new(
      StringIO.new(invalid_csv_content),
      'text/csv',
      original_filename: 'invalid.csv'
    )
  end

  let(:invalid_locale_file) do
    Rack::Test::UploadedFile.new(
      StringIO.new(invalid_locale_content),
      'text/csv',
      original_filename: 'invalid_locale.csv'
    )
  end

  describe 'validations' do
    it 'is valid with proper CSV file' do
      form = described_class.new(file: valid_file)
      expect(form).to be_valid
    end

    it 'is invalid without file' do
      form = described_class.new
      expect(form).not_to be_valid
      expect(form.errors[:file]).to include("can't be blank")
    end

    it 'is invalid with wrong file type' do
      file = Rack::Test::UploadedFile.new(
        StringIO.new('test'),
        'text/plain',
        original_filename: 'test.txt'
      )
      form = described_class.new(file: file)
      expect(form).not_to be_valid
    end

    it 'is invalid when required columns are missing' do
      form = described_class.new(file: invalid_file)
      expect(form).not_to be_valid
      expect(form.errors[:base]).to include('Missing required columns: Locale')
    end
  end
end
