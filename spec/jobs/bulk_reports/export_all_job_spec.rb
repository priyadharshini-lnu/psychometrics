require 'rails_helper'

describe BulkReports::ExportAllJob do
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
  let(:items) { [] }
  let(:input_dir) { 'dir' }
  let(:bulk_report) { double('bulk_report', input_dir: input_dir) }

  describe '#perform' do
    context 'project level' do
      let(:client) { double('client', project?: true, id: 1) }
      let(:query) { ::Queries::Reports::ProjectLevel::BulkReportWithOptions }

      it 'calls ::Queries::Reports::ProjectLevel::BulkReportWithOptions' do
        expect(query).to receive(:call).with(client.id, report_ids, start_date, end_date).and_return([])
        described_class.perform_now(params)
      end

      context 'when query results are not empty' do
        let(:item) { double('item', id: 1, user_id: 1, assign_id: 1, assigns_report_id: 1) }
        let(:items) { [item] }
        let(:job_params) { [] }

        it 'performs ExportJob' do
          expect(query).to receive(:call).with(any_args).and_return(items)
          expect(BulkReport).to receive(:create).with(user: current_user).and_return(bulk_report)
          expect_any_instance_of(described_class).to receive(:job_params).with(bulk_report, item, params).and_return(job_params)
          expect(BulkReports::ExportJob).to receive(:perform_now).with(job_params)
          expect(BulkReports::CompressJob).to receive(:perform_now).with(bulk_report)
          expect(BulkReportMailer).to receive_message_chain(:notify, :deliver_later)
          expect(FileUtils).to receive(:rm_rf).with(input_dir)
          described_class.perform_now(params)
        end
      end
    end

    context 'subproject level' do
      let(:client) { double('client', project?: false, id: 1) }
      let(:query) { ::Queries::Reports::SubProjectLevel::BulkReportWithOptions }

      it 'calls ::Queries::Reports::SubProjectLevel::BulkReportWithOptions' do
        expect(query).to receive(:call).with(client.id, report_ids, start_date, end_date).and_return([])
        described_class.perform_now(params)
      end
    end
  end
end
