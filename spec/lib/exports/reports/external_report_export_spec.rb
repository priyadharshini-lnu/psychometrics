require 'rails_helper'

describe Exports::Reports::Pdf::ExternalReportExport do
  describe '.export' do
    let(:report) { double('report') }
    let(:user) { double('user') }
    let(:external_report_path) { 'external_report_path' }
    let(:opts) { {} }
    let(:output_dir) { 'test' }
    let(:output_path) { 'test' }

    it 'copies external report to output dir' do
      expect(described_class).to receive(:output_dir).with(user, opts).and_return(output_dir)
      expect(described_class).to receive(:output_path).with(user, report, output_dir).and_return(output_path)
      expect(FileUtils).to receive(:mkdir_p).with(output_dir)
      expect(FileUtils).to receive(:cp).with(external_report_path, output_path, verbose: true)
      described_class.export(report, user, external_report_path, opts)
    end
  end
end
