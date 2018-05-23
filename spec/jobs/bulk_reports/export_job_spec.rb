require 'rails_helper'

describe BulkReports::ExportJob do
  # let(:bulk_report) { build_stubbed(:bulk_report) }
  let(:bulk_report) { build_stubbed(:bulk_report) }
  let(:current_user) { build_stubbed(:user) }
  let(:report) { build_stubbed(:report) }
  let(:user) { build_stubbed(:user) }
  let(:client) { build_stubbed(:client) }
  let(:scheme) { 'http' }
  let(:opts) { {} }

  describe '#perform' do
    it 'performs export' do
      expect(::Exports::Reports::Pdf::ReportExport).to receive(:export).with(current_user, report, user, client, scheme, opts)
      expect(bulk_report).to receive(:decrement_queue_size)
      described_class.perform_now(bulk_report, current_user, report, user, client, scheme, opts)
    end
  end
end
