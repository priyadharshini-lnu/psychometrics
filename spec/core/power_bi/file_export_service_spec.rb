# frozen_string_literal: true

require 'rails_helper'

describe PowerBi::FileExportService do
  let(:parameters) do
    {
      'report_id' => 'test-report-id',
      'dataset_id' => 'test-dataset-id',
      'format' => 'PPTX'
    }
  end
  let(:service) { described_class.new(parameters, { username: 'test@example.com' }) }
  let(:config) do
    {
      group_id: 'test-group-id'
    }
  end
  let(:export_to_file) { instance_double(PowerBi::ExportToFile) }
  let(:get_export_status) { instance_double(PowerBi::GetExportStatus) }
  let(:get_export_file) { instance_double(PowerBi::GetExportFile) }
  let(:export_response) { { 'id' => 'export-123' } }
  let(:file_stream) { 'pptx-file-content' }

  before do
    allow(Settings.secrets).to receive(:power_bi).and_return(config)
  end

  describe '#call' do
    it 'calls export_powerbi_dashboard' do
      expect(service).to receive(:export_powerbi_dashboard)
      service.call
    end
  end

  describe '#export_powerbi_dashboard' do
    before do
      allow(PowerBi::ExportToFile).to receive(:new).with('test-report-id', hash_including(format: 'PPTX'),
                                                         'test-group-id').and_return(export_to_file)
      allow(export_to_file).to receive(:call).and_return(export_response)
      allow(service).to receive(:poll_export_completion)
    end

    it 'calls ExportToFile with correct params and polls for completion' do
      expect(PowerBi::ExportToFile).to receive(:new).with('test-report-id', hash_including(format: 'PPTX'),
                                                          'test-group-id').and_return(export_to_file)
      expect(export_to_file).to receive(:call).and_return(export_response)
      expect(service).to receive(:poll_export_completion).with('test-report-id', 'export-123')
      service.send(:export_powerbi_dashboard)
    end
  end

  describe '#poll_export_completion' do
    let(:report_id) { 'test-report-id' }
    let(:export_id) { 'export-123' }

    before do
      allow(PowerBi::GetExportStatus).to receive(:new).with(report_id, export_id,
                                                            config[:group_id]).and_return(get_export_status)
      allow(PowerBi::GetExportFile).to receive(:new).with(report_id, export_id,
                                                          config[:group_id]).and_return(get_export_file)
    end

    context 'when export succeeds immediately' do
      before do
        allow(get_export_status).to receive(:call).and_return({ 'status' => 'Succeeded' })
        allow(get_export_file).to receive(:call).and_return(file_stream)
      end

      it 'returns the file stream' do
        expect(service.send(:poll_export_completion, report_id, export_id)).to eq(file_stream)
      end
    end

    context 'when export is running then succeeds' do
      before do
        allow(get_export_status).to receive(:call).and_return({ 'status' => 'Running' }, { 'status' => 'Succeeded' })
        allow(get_export_file).to receive(:call).and_return(file_stream)
        allow(service).to receive(:sleep)
      end

      it 'polls until succeeded and returns file stream' do
        expect(get_export_status).to receive(:call).twice
        expect(service).to receive(:sleep).with(5).once
        expect(service.send(:poll_export_completion, report_id, export_id)).to eq(file_stream)
      end
    end

    context 'when export status is NotStarted then succeeds' do
      before do
        allow(get_export_status).to receive(:call).and_return({ 'status' => 'NotStarted' }, { 'status' => 'Succeeded' })
        allow(get_export_file).to receive(:call).and_return(file_stream)
        allow(service).to receive(:sleep)
      end

      it 'polls until succeeded and returns file stream' do
        expect(get_export_status).to receive(:call).twice
        expect(service).to receive(:sleep).with(5).once
        expect(service.send(:poll_export_completion, report_id, export_id)).to eq(file_stream)
      end
    end

    context 'when export fails' do
      before do
        allow(get_export_status).to receive(:call).and_return({ 'status' => 'Failed',
                                                                'error' => 'Something went wrong' })
      end

      it 'raises an error with the failure message' do
        expect do
          service.send(:poll_export_completion, report_id, export_id)
        end.to raise_error('Export failed: Something went wrong')
      end
    end

    context 'when export times out' do
      before do
        allow(get_export_status).to receive(:call).and_return({ 'status' => 'Running' })
        allow(service).to receive(:sleep)
      end

      it 'raises timeout error after max attempts' do
        expect(service).to receive(:sleep).with(5).exactly(59).times
        expect do
          service.send(:poll_export_completion, report_id, export_id)
        end.to raise_error('Export timed out after 60 attempts')
      end
    end

    context 'when export status is unknown' do
      before do
        allow(get_export_status).to receive(:call).and_return({ 'status' => 'WeirdStatus' })
      end

      it 'raises an error for unknown status' do
        expect do
          service.send(:poll_export_completion, report_id, export_id)
        end.to raise_error('Unknown export status: WeirdStatus')
      end
    end
  end
end
