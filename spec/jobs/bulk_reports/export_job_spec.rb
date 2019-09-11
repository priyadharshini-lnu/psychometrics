# frozen_string_literal: true

require 'rails_helper'

describe BulkReports::ExportJob do
  let(:bulk_report)     { build_stubbed(:bulk_report) }
  let(:current_user)    { create(:user) }
  let(:report)          { create(:report) }
  let(:assign)          { create(:assign) }
  let(:assigns_report)  { create(:assigns_report, :licensed, assign: assign, report: report) }
  let(:user)            { build_stubbed(:user) }
  let(:client)          { build_stubbed(:client) }
  let(:file)            { double(:file, file: 'file') }
  let(:params) do
    {
      bulk_report: bulk_report,
      report: report,
      assign: assign,
      assigns_report: assigns_report,
      user: user
    }
  end

  describe '#perform' do
    subject { described_class.perform_now(params) }

    before do
      allow(report).to receive(:external_report?).with(no_args).and_return(is_external_report)
    end

    context 'for external report' do
      let(:is_external_report) { true }

      it 'returns external file' do
        expect(assign).to receive_message_chain(:mindmill_report, :file)
        expect(assigns_report).to receive_message_chain(:external_report, :file)

        subject
      end

      it 'if report_file is nil' do
        expect_any_instance_of(described_class).not_to receive(:make_path)
        expect_any_instance_of(described_class).not_to receive(:download_report)

        subject
      end
    end

    context 'for regular report' do
      let(:is_external_report) { false }

      it "calls 'ReportExport.export'" do
        expect(assigns_report).to receive_message_chain(:pdf, :file)
        described_class.perform_now(params)
      end
    end
  end
end
