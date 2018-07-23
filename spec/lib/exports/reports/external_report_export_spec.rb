require 'rails_helper'

describe Exports::Reports::Pdf::ExternalReportExport do
  describe '.export' do
    let(:assign) { double('assign') }
    let(:report) { double('report') }
    let(:assigns_report) { double('assigns_report') }
    let(:user) { double('user') }
    let(:external_report) { double('external_report') }
    let(:external_report_path) { 'external_report_path' }
    let(:opts) { {} }
    let(:output_dir) { 'test' }
    let(:output_path) { 'test' }

    it 'copies external report to output dir' do
      expect(described_class).to receive(:external_report).with(assign, assigns_report).and_return(external_report)
      expect(described_class).to receive(:output_dir).with(user, opts).and_return(output_dir)
      expect(described_class).to receive(:output_path).with(user, report, output_dir).and_return(output_path)
      expect(FileUtils).to receive(:mkdir_p).with(output_dir)
      expect(described_class).to receive(:copy_external_report).with(external_report, output_path)
      described_class.export(assign, report, assigns_report, user, opts)
    end
  end
end
