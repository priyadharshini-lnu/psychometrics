# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Api::V2::Administration::SkillImportForm do
  let(:form) { described_class.new }
  let(:valid_csv_file) do
    fixture_file_upload(
      Rails.root.join('spec/fixtures/files/skills.csv'),
      'text/csv'
    )
  end
  let(:invalid_format_file) do
    fixture_file_upload(
      Rails.root.join('spec/fixtures/files/invalid.txt'),
      'text/plain'
    )
  end
  let(:invalid_csv_file) do
    fixture_file_upload(
      Rails.root.join('spec/fixtures/files/invalid_skills.csv'),
      'text/csv'
    )
  end

  describe 'validations' do
    context 'when file is not present' do
      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:file]).to include("can't be blank")
      end
    end

    context 'when file has invalid format' do
      before do
        form.file = invalid_format_file
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:file]).to include('must be a CSV file')
      end
    end

    context 'when CSV file is missing required columns' do
      before do
        form.file = invalid_csv_file
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include(match(/Missing required columns/))
      end
    end

    context 'when CSV file has malformed content' do
      before do
        allow(CSV).to receive(:parse).and_raise(CSV::MalformedCSVError.new('Invalid CSV format', 1))
        form.file = valid_csv_file
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include('Invalid CSV format: Invalid CSV format in line 1.')
      end
    end

    context 'when file is valid' do
      before do
        allow(CSV).to receive(:parse).and_return([described_class::REQUIRED_FIELDS])
        form.file = valid_csv_file
      end

      it 'is valid' do
        expect(form).to be_valid
      end
    end
  end

  describe '#processed_file' do
    context 'when form is invalid' do
      it 'returns nil' do
        expect(form.processed_file).to be_nil
      end
    end

    context 'when form is valid' do
      before do
        allow(CSV).to receive(:parse).and_return([described_class::REQUIRED_FIELDS])
        form.file = valid_csv_file
      end

      it 'returns the file' do
        expect(form.processed_file).to eq(valid_csv_file)
      end
    end
  end

  describe 'REQUIRED_FIELDS constant' do
    it 'contains the expected fields' do
      expect(described_class::REQUIRED_FIELDS).to eq(%w[ID Name Description])
    end

    it 'is frozen' do
      expect(described_class::REQUIRED_FIELDS).to be_frozen
    end
  end
end
