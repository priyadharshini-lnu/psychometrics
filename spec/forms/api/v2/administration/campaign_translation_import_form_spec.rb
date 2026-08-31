# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::CampaignTranslationImportForm do
  let(:valid_csv_content) do
    <<~CSV
      Campaign ID,English / en,Spanish / es
      123,Campaign EN,Campaña ES
    CSV
  end

  let(:blank_translation_csv_content) do
    <<~CSV
      Campaign ID,English / en,Spanish / es
      123,,
    CSV
  end

  let(:missing_english_column_csv_content) do
    <<~CSV
      Campaign ID,Spanish / es
      123,Campaña ES
    CSV
  end

  let(:invalid_locale_csv_content) do
    <<~CSV
      Campaign ID,English / en,Not A Locale / xyz
      123,Campaign EN,Test
    CSV
  end

  def build_upload(content, content_type: 'text/csv', filename: 'campaign-translations.csv')
    file = Tempfile.new(filename)
    file.write(content)
    file.rewind

    Rack::Test::UploadedFile.new(file.path, content_type, original_filename: filename)
  end

  describe 'validations' do
    it 'is valid with campaign id and locale headers' do
      form = described_class.new(file: build_upload(valid_csv_content))

      expect(form).to be_valid
      expect(form.row_count).to eq(1)
    end

    it 'is valid when english header is missing' do
      form = described_class.new(file: build_upload(missing_english_column_csv_content))

      expect(form).to be_valid
      expect(form.row_count).to eq(1)
    end

    it 'is valid when all translation cells are blank' do
      form = described_class.new(file: build_upload(blank_translation_csv_content))

      expect(form).to be_valid
      expect(form.row_count).to eq(1)
    end

    it 'is invalid without file' do
      form = described_class.new

      expect(form).not_to be_valid
      expect(form.errors[:file]).to include("can't be blank")
    end

    it 'is invalid with wrong file type' do
      file = build_upload('test', content_type: 'text/plain', filename: 'test.txt')
      form = described_class.new(file: file)

      expect(form).not_to be_valid
      expect(form.errors[:file]).to include(
        I18n.t('administration.campaigns.bulk_import_translations.errors.must_be_csv')
      )
    end

    it 'is invalid when required columns are missing' do
      csv = <<~CSV
        English / en,Spanish / es
        Campaign EN,Campaña ES
      CSV

      form = described_class.new(file: build_upload(csv))

      expect(form).not_to be_valid
      expect(form.errors[:base]).to include('Missing required columns: Campaign ID')
    end

    it 'is invalid when locale headers are unknown' do
      form = described_class.new(file: build_upload(invalid_locale_csv_content))

      expect(form).not_to be_valid
      expect(form.errors[:base]).to include('Invalid language columns: Not A Locale / xyz')
    end

    it 'is invalid when campaign id is blank' do
      csv = <<~CSV
        Campaign ID,English / en
        ,Campaign EN
      CSV

      form = described_class.new(file: build_upload(csv))

      expect(form).not_to be_valid
      expect(form.errors[:base]).to include('Row 2: Campaign ID cannot be blank')
    end
  end
end
