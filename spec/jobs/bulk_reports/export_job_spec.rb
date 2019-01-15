require 'rails_helper'

describe BulkReports::ExportJob do
  let(:bulk_report) { build_stubbed(:bulk_report) }
  let(:current_user) { build_stubbed(:user) }
  let(:report) { build_stubbed(:report) }
  let(:assign) { double(:assign) }
  let(:assigns_report) { double(:assigns_report) }
  let(:user) { build_stubbed(:user) }
  let(:client) { build_stubbed(:client) }
  let(:file) { double(:file, file: 'file') }
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
      opts: opts
    }
  end

  describe '#perform' do
    before do
      allow(report).to receive(:external_report?).with(no_args).and_return(is_external_report)
    end

    context 'for external report' do
      let(:is_external_report) { true }

      it "calls 'ExternalReportExport.export'" do
        expect(::Exports::Reports::Pdf::ExternalReportExport).not_to receive(:export).with(assign, report, assigns_report, user, opts)
        expect(assign).to receive_message_chain(:mindmill_report, :file)
        expect(assigns_report).to receive_message_chain(:external_report, :file)

        described_class.perform_now(params)
      end
    end

    context 'for regular report' do
      let(:is_external_report) { false }

      it "calls 'ReportExport.export'" do
        expect(::Exports::Reports::Pdf::ReportExport).not_to receive(:export).with(current_user, report, user, client, opts)
        expect(assigns_report).to receive_message_chain(:pdf, :file)
        described_class.perform_now(params)
      end
    end
  end
end
