require 'rails_helper'

describe Exports::Reports::Pdf::BulkReportExport do
  describe '.export' do
    let(:current_user) { double('user') }
    let(:client) { double('client', id: 1) }
    let(:report_ids) { double('report_ids') }
    let(:start_date) { double('start_date') }
    let(:end_date) { double('end_date') }
    let(:scheme) { 'http' }
    let(:opts) { {} }
    let(:params) {
      {
        current_user: current_user,
        client: client,
        report_ids: report_ids,
        start_date: start_date,
        end_date: end_date,
        scheme: scheme,
        opts: opts
      }
    }

    context 'project level' do
      let(:client) { double('client', project?: true, id: 1) }
      let(:query) { ::Queries::Reports::ProjectLevel::BulkReportWithOptions }

      it 'calls ::Queries::Reports::ProjectLevel::BulkReportWithOptions' do
        expect(query).to receive(:call).with(client.id, report_ids, start_date, end_date).and_return([])
        described_class.export(params)
      end

      context 'when query results are not empty' do
        let(:item) { double('item', id: 1, user_id: 1, assign_id: 1, assigns_report_id: 1) }
        let(:items) { [item] }
        let(:bulk_report) { double('bulk_report') }
        let(:report) { double('report') }
        let(:user) { double('user') }
        let(:assign) { double('assign') }
        let(:assigns_report) { double('assigns_report') }
        let(:export_params) do
          {
            bulk_report: bulk_report,
            report: report,
            assign: assign,
            assigns_report: assigns_report,
            user: user,
          }
        end

        it 'enqueues ExportJob' do
          allow(query).to receive(:call).with(any_args).and_return(items)
          expect(BulkReport).to receive(:create).with(user: current_user, queue_size: items.size).and_return(bulk_report)

          expect(Report).to receive(:find).with(item.id).and_return(report)
          expect(User).to receive(:find).with(item.user_id).and_return(user)
          expect(Assign).to receive(:find).with(item.assign_id).and_return(assign)
          expect(AssignsReport).to receive(:find).with(item.assigns_report_id).and_return(assigns_report)
          expect(BulkReports::ExportJob).to receive(:perform_later).with(export_params)
          described_class.export(params)
        end
      end
    end

    context 'sub-project level' do
      let(:client) { double('client', project?: false, id: 1) }
      let(:query) { ::Queries::Reports::SubProjectLevel::BulkReportWithOptions }

      it 'calls ::Queries::Reports::SubProjectLevel::BulkReportWithOptions' do
        expect(query).to receive(:call).with(client.id, report_ids, start_date, end_date).and_return([])
        described_class.export(params)
      end
    end
  end
end
