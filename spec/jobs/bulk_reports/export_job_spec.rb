require 'rails_helper'

describe BulkReports::ExportJob do
  let(:bulk_report) { build_stubbed(:bulk_report) }
  let(:current_user) { build_stubbed(:user) }
  let(:report) { build_stubbed(:report) }
  let(:assign) { double(:assign) }
  let(:assigns_report) { double(:assigns_report) }
  let(:user) { build_stubbed(:user) }
  let(:client) { build_stubbed(:client) }
  let(:scheme) { 'http' }
  let(:opts) { {} }
  let(:params) do
    {
      bulk_report: bulk_report,
      current_user: current_user,
      report: report,
      assign: assign,
      assigns_report: assigns_report,
      user: user,
      client: client,
      scheme: scheme,
      opts: opts
    }
  end

  describe '#perform' do
    before do
      expect_any_instance_of(described_class).to receive(:external_report_path).with(params).and_return(external_report_path)
    end

    context 'for external report' do
      let(:external_report_path) { 'test' }

      it "calls 'ExternalReportExport.export'" do
        expect(::Exports::Reports::Pdf::ExternalReportExport).to receive(:export).with(report, user, external_report_path, opts)
        expect(bulk_report).to receive(:decrement_queue_size)
        described_class.perform_now(params)
      end
    end

    context 'for regular report' do
      let(:external_report_path) { nil }

      it "calls 'ReportExport.export'" do
        expect(::Exports::Reports::Pdf::ReportExport).to receive(:export).with(current_user, report, user, client, scheme, opts)
        expect(bulk_report).to receive(:decrement_queue_size)
        described_class.perform_now(params)
      end
    end
  end
end
