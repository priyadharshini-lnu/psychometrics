# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::SkillTranslationImportForm do
  let(:valid_file) { fixture_file_upload('import_skills_translations/valid_data.csv', 'text/csv') }
  let(:invalid_file) { fixture_file_upload('import_skills_translations/invalid_data.csv', 'text/csv') }
  let(:invalid_format_file) { fixture_file_upload('import_skills_translations/invalid_format_data.csv', 'text/csv') }

  let(:valid_csv_content) do
    <<~CSV
      ID,Locale,Name,Description
      1#Name,en,Test Skill,Test Description
      1#Description,en,,Test Description
    CSV
  end

  let(:invalid_csv_content) do
    <<~CSV
      Name,Description
      Test Skill,Test Description
    CSV
  end

  let(:invalid_format_content) do
    <<~CSV
      ID,Locale,Name,Description
      1,en,Test Skill,Test Description
    CSV
  end

  describe 'validations' do
    context 'with valid CSV file' do
      before do
        allow(File).to receive(:read).with(valid_file, encoding: 'bom|utf-8').and_return(valid_csv_content)
      end

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
    end

    context 'with invalid CSV file' do
      it 'is invalid when required columns are missing' do
        allow(File).to receive(:read).with(invalid_file, encoding: 'bom|utf-8').and_return(invalid_csv_content)
        form = described_class.new(file: invalid_file)
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include('Missing required columns: ID')
      end

      it 'is invalid when ID format is incorrect' do
        allow(File).to receive(:read).with(
          invalid_format_file, encoding: 'bom|utf-8'
        ).and_return(invalid_format_content)
        allow(I18n).to receive(:t).with('administration.skills.translations.import.errors.invalid_id_format',
                                        any_args).and_return('Invalid ID format')

        form = described_class.new(file: invalid_format_file)
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include('Invalid ID format')
      end
    end
  end
end
