# frozen_string_literal: true

require 'rails_helper'
require 'csv'

RSpec.describe Saville::CopyAssessmentsFromCsv do
  let(:csv_content) do
    CSV.generate do |csv|
      csv << ['User Email', 'To Campaign ID', 'From Campaign ID', 'Assessment ID']
      csv << ['user@example.com', '123', '456', '789']
    end
  end
  let(:start_row) { 2 }
  let(:instance) { described_class.new(csv_url, start_row) }

  describe '#call' do
    context 'with a local file' do
      let(:csv_url) { 'file:///path/to/local/file.csv' }

      before do
        allow(File).to receive(:open).and_yield(StringIO.new(csv_content))
      end

      it 'processes the CSV file' do
        expect(instance).to receive(:process_file_content).with(csv_content)
        instance.call
      end
    end

    context 'with a remote file' do
      let(:csv_url) { 'https://example.com/file.csv' }
      let(:uri) { URI(csv_url) }
      let(:http_double) { instance_double(Net::HTTP) }
      let(:response_double) { instance_double(Net::HTTPResponse) }

      before do
        allow(Net::HTTP).to receive(:start).and_yield(http_double)
        allow(http_double).to receive(:request).and_yield(response_double)
        allow(response_double).to receive(:read_body).and_yield(csv_content)
      end

      it 'processes the CSV file' do
        expect(instance).to receive(:process_file_content).with(csv_content)
        instance.call
      end
    end
  end

  describe '#process_file_content' do
    let(:csv_url) { 'file:///path/to/local/file.csv' }

    before do
      allow(Saville::MigrateAssessmentForm).to receive(:new).and_return(double(valid?: true))
      allow(Saville::MigrateAssessment).to receive(:call!)
      allow(Rails.logger).to receive(:info)
    end

    it 'processes valid rows' do
      expect(Saville::MigrateAssessment).to receive(:call!).once
      instance.send(:process_file_content, csv_content)
    end

    context 'with invalid headers' do
      let(:csv_content) do
        CSV.generate do |csv|
          csv << ['Invalid Header']
          csv << ['data']
        end
      end

      it 'raises an error' do
        expect { instance.send(:process_file_content, csv_content) }.to raise_error(/Missing headers/)
      end
    end
  end

  describe '#validate_headers' do
    let(:instance) { described_class.new('http://example.com/test.csv', 2) }

    it 'raises an error for missing headers' do
      expect { instance.send(:validate_headers, ['Invalid Header']) }.to raise_error(/Missing headers/)
    end

    it 'does not raise an error for valid headers' do
      expect do
        instance.send(:validate_headers,
                      ['User Email', 'To Campaign ID', 'From Campaign ID', 'Assessment ID'])
      end.not_to raise_error
    end
  end

  describe '#process_row' do
    let(:csv_url) { 'https://example.com/file.csv' }
    let(:row) do
      CSV::Row.new(['User Email', 'To Campaign ID', 'From Campaign ID', 'Assessment ID'],
                   ['user@example.com', '123', '456', '789'])
    end
    let(:form_double) { instance_double(Saville::MigrateAssessmentForm, valid?: true) }

    before do
      allow(Saville::MigrateAssessmentForm).to receive(:new).and_return(form_double)
      allow(Saville::MigrateAssessment).to receive(:call!)
      allow(Rails.logger).to receive(:info)
    end

    it 'processes a valid row' do
      expect(Saville::MigrateAssessment).to receive(:call!).with(form_double)
      expect(Rails.logger).to receive(:info)
      instance.send(:process_row, row, 2)
    end

    context 'with invalid form data' do
      let(:form_double) do
        instance_double(Saville::MigrateAssessmentForm, valid?: false, errors: double(full_messages: ['Invalid data']))
      end

      before do
        allow(Saville::MigrateAssessmentForm).to receive(:new).and_return(form_double)
      end

      it 'raises an error' do
        expect { instance.send(:process_row, row, 2) }.to raise_error('Invalid data')
      end
    end
  end
end
