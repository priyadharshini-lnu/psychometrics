# frozen_string_literal: true

require 'rails_helper'

describe ReflectionQuestions::ImportForm do
  let(:form) { described_class.new }
  let(:csv_file) { fixture_file_upload('import_reflection_questions/valid_data.csv', 'text/csv') }
  let(:invalid_data_csv) { fixture_file_upload('import_reflection_questions/invalid_data.csv', 'text/csv') }
  let(:non_csv_file) { fixture_file_upload('import_reflection_questions/non_csv_file.xml', 'text/plain') }

  before do
    allow(File).to receive(:read).and_call_original
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
        allow(File).to receive(:read).with(non_csv_file, encoding: 'bom|utf-8').and_return('not csv content')
      end

      it 'is invalid' do
        form.valid?
        expect(form.errors[:file]).to include('File must be a CSV file')
      end
    end

    context 'with invalid data in rows' do
      before do
        form.file = invalid_data_csv
        allow(File).to receive(:read).with(invalid_data_csv, encoding: 'bom|utf-8').and_return('csv content')
      end

      it 'validates mandatory field format' do
        allow(CSVSafe).to receive(:parse).and_return([
          ['ID', 'Mandatory', 'MinWords', 'MaxWords', 'English / en'],
          ['1', 'invalid', '10', '100', 'Question text']
        ])
        form.valid?
        expect(form.errors[:base]).to include('Invalid Mandatory column value format 2')
      end

      it 'validates MinWords field format' do
        allow(CSVSafe).to receive(:parse).and_return([
          ['ID', 'Mandatory', 'MinWords', 'MaxWords', 'English / en'],
          ['1', 'yes', 'abc', '100', 'Question text']
        ])
        form.valid?
        expect(form.errors[:base]).to include('Invalid Minimum Words column value format 2')
      end

      it 'validates MaxWords field format' do
        allow(CSVSafe).to receive(:parse).and_return([
          ['ID', 'Mandatory', 'MinWords', 'MaxWords', 'English / en'],
          ['1', 'yes', '10', 'abc', 'Question text']
        ])
        form.valid?
        expect(form.errors[:base]).to include('Invalid Maximum Words column value format 2')
      end
    end

    context 'with valid CSV file' do
      before do
        form.file = csv_file
        valid_headers = ['ID', 'Mandatory', 'MinWords', 'MaxWords', 'English / en']
        valid_data = ['1', 'yes', '10', '100', 'Question text']
        allow(File).to receive(:read).with(csv_file, encoding: 'bom|utf-8').and_return('csv content')
        allow(CSVSafe).to receive(:parse).and_return([valid_headers, valid_data])
      end

      it 'is valid' do
        expect(form.valid?).to be true
      end
    end
  end
end
