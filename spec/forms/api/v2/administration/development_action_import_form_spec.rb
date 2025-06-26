# frozen_string_literal: true

require 'rails_helper'

describe Api::V2::Administration::DevelopmentActionImportForm do
  let(:form) { described_class.new }
  let(:csv_file) { fixture_file_upload('import_development_actions/valid_data.csv', 'text/csv') }
  let(:invalid_data_csv) { fixture_file_upload('import_development_actions/invalid_data.csv', 'text/csv') }
  let(:non_csv_file) { fixture_file_upload('import_development_actions/non_csv_file.xml', 'text/plain') }

  before do
    allow(I18n).to receive(:t).and_call_original
    allow(I18n).to receive(:available_locales).and_return(%i[en fr de])
  end

  describe 'validations' do
    context 'when file is not present' do
      it 'is invalid' do
        form.valid?
        expect(form.errors[:file]).to include("can't be blank")
      end
    end

    context 'when file is not a CSV' do
      before do
        form.file = non_csv_file
        allow(non_csv_file).to receive(:content_type).and_return('text/plain')
      end

      it 'is invalid' do
        form.valid?
        expect(form.errors[:file]).to include(
          I18n.t('administration.development_action_import.errors.csv_file_required')
        )
      end
    end

    context 'when required columns are missing' do
      before do
        form.file = csv_file
        allow(File).to receive(:read).with(csv_file.path, encoding: 'bom|utf-8').and_return("SkillID,Name\n1,Test")
      end

      it 'adds a base error for missing columns' do
        allow(CSVSafe).to receive(:read).with(
          csv_file.path,
          encoding: 'bom|utf-8'
        ).and_return([
          %w[SkillID Name],
          %w[1 Test]
        ])
        form.valid?
        expect(form.errors[:base].first).to match(
          I18n.t(
            'administration.development_action_import.errors.missing_columns',
            fields: 'Description, Type, DevelopmentActionType'
          )
        )
      end
    end

    context 'with invalid data in rows' do
      before do
        form.file = invalid_data_csv
        allow(File).to receive(:read).with(invalid_data_csv.path, encoding: 'bom|utf-8').and_return('csv content')
      end

      it 'validates invalid duration format' do
        allow(CSVSafe).to receive(:read).with(
          invalid_data_csv.path,
          encoding: 'bom|utf-8'
        ).and_return([
          %w[SkillID Name Description Type DevelopmentActionType Duration],
          %w[1 Test Desc structured_learning course abc]
        ])
        form.valid?
        expect(form.errors[:base].first).to match(
          I18n.t(
            'administration.development_action_import.errors.invalid_duration_format',
            row: 2, value: 'abc'
          )
        )
      end

      it 'validates invalid learning style' do
        allow(CSVSafe).to receive(:read).with(
          invalid_data_csv.path,
          encoding: 'bom|utf-8'
        ).and_return([
          %w[SkillID Name Description Type DevelopmentActionType],
          %w[1 Test Desc invalid_type course]
        ])
        form.valid?
        expect(form.errors[:base].first).to match(
          I18n.t(
            'administration.development_action_import.errors.invalid_learning_style',
            row: 2, value: 'invalid_type', valid_types: 'structured_learning, learning_from_others, on_the_job'
          )
        )
      end

      it 'validates invalid development action type' do
        allow(CSVSafe).to receive(:read).with(
          invalid_data_csv.path,
          encoding: 'bom|utf-8'
        ).and_return([
          %w[SkillID Name Description Type DevelopmentActionType],
          %w[1 Test Desc structured_learning invalid_type]
        ])
        form.valid?
        expect(form.errors[:base].first).to match(
          I18n.t(
            'administration.development_action_import.errors.invalid_development_action_type',
            row: 2, value: 'invalid_type', valid_development_action_types: 'course, default'
          )
        )
      end

      it 'validates invalid date format' do
        allow(CSVSafe).to receive(:read).with(
          invalid_data_csv.path,
          encoding: 'bom|utf-8'
        ).and_return([
          %w[SkillID Name Description Type DevelopmentActionType CourseStartDate],
          %w[1 Test Desc structured_learning course not_a_date]
        ])
        form.valid?
        expect(form.errors[:base].first).to match(
          I18n.t(
            'administration.development_action_import.errors.invalid_date_format',
            row: 2, field: 'CourseStartDate'
          )
        )
      end

      it 'validates available languages only for courses' do
        allow(CSVSafe).to receive(:read).with(
          invalid_data_csv.path,
          encoding: 'bom|utf-8'
        ).and_return([
          %w[SkillID Name Description Type DevelopmentActionType AvailableLanguages],
          %w[1 Test Desc structured_learning default en,fr]
        ])
        form.valid?
        expect(form.errors[:base].first).to match(
          I18n.t(
            'administration.development_action_import.errors.languages_only_for_courses',
            row: 2
          )
        )
      end

      it 'validates invalid available languages' do
        allow(CSVSafe).to receive(:read).with(
          invalid_data_csv.path,
          encoding: 'bom|utf-8'
        ).and_return([
          %w[SkillID Name Description Type DevelopmentActionType AvailableLanguages],
          %w[1 Test Desc structured_learning course en,xx]
        ])
        form.valid?
        expect(form.errors[:base].first).to match(
          I18n.t(
            'administration.development_action_import.errors.invalid_languages',
            row: 2,
            invalid_languages: 'xx'
          )
        )
      end

      it 'validates blank required fields' do
        allow(CSVSafe).to receive(:read).with(
          invalid_data_csv.path,
          encoding: 'bom|utf-8'
        ).and_return([
          %w[SkillID Name Description Type DevelopmentActionType],
          ['', '', '', '', '']
        ])
        form.valid?
        expect(form.errors[:base].first).to match(
          I18n.t(
            'administration.development_action_import.errors.blank_field',
            row: 2, field: 'SkillID'
          )
        )
      end
    end

    context 'with valid CSV file' do
      before do
        form.file = csv_file
        allow(csv_file).to receive(:content_type).and_return('text/csv')
        allow(csv_file).to receive(:rewind)
        allow(CsvFileParser).to receive(:call!).and_return([
          %w[SkillID Name Description Type DevelopmentActionType Duration AvailableLanguages],
          ['1', 'Test', 'Desc', 'structured_learning', 'course', '10', 'en,fr']
        ])
      end

      it 'is valid' do
        expect(form.valid?).to be true
      end
    end
  end
end
