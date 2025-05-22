# frozen_string_literal: true

require 'rails_helper'
require 'open-uri'

RSpec.describe CsvFileParser do
  let(:valid_csv_content) { "ID,Name\n1,Test Name" }
  let(:invalid_csv_content) { "ID,Name\n1,\"Test Name\n2,Another Name" }
  let(:valid_file) { fixture_file_upload('import_reflection_questions/invalid_data.csv', 'text/csv') }

  describe '#call' do
    context 'when file is an uploaded file' do
      it 'parses the CSV file successfully' do
        parser = described_class.new(valid_file, headers: true)
        expect { parser.call }.not_to raise_error
      end

      it 'raises an error for invalid CSV content' do
        allow(CSVSafe).to receive(:read).with(
          valid_file.path,
          encoding: 'bom|utf-8',
          headers: true
        ).and_raise(CSV::MalformedCSVError.new('Invalid CSV format', 1))
        parser = described_class.new(valid_file, headers: true)

        expect { parser.call }.to raise_error(
          CSV::MalformedCSVError,
          'Invalid CSV format in line 1.'
        )
      end
    end

    context 'when file is a remote URL' do
      let(:file_url) { 'http://example.com/valid.csv' }
      let(:file) { double('File', url: file_url) }

      context 'when the URL is valid' do
        before do
          allow(URI).to receive(:parse).and_return(URI(file_url))
          allow_any_instance_of(URI::HTTP).to receive(:open).and_return(StringIO.new(valid_csv_content))
        end

        it 'fetches and parses the CSV file successfully' do
          parser = described_class.new(file, headers: true)
          expect { parser.call }.not_to raise_error
        end
      end

      context 'when the URL is unreachable' do
        it 'raises an error for invalid URL' do
          invalid_file = double('File', url: 'invalid_url')
          parser = described_class.new(invalid_file, headers: true)

          expect { parser.call }.to raise_error(Errors::DownloadFailedError)
        end

        it 'raises an error for malformed CSV content' do
          allow_any_instance_of(URI::HTTP).to receive(:open).and_return(StringIO.new(invalid_csv_content))
          parser = described_class.new(file, headers: true)

          expect { parser.call }.to raise_error(Errors::DownloadFailedError)
        end
      end
    end
  end
end
