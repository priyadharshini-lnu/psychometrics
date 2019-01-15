require 'rails_helper'

describe Reports::BulkExportJob do
  let(:client)          { double('client', id: 1) }
  let(:assigns_report)  { double('assigns_report', id: 1) }
  let(:report_ids)      { [1, 2] }
  let(:query)           { double('query', query: assigns_reports) }
  let(:assigns_reports) { double('assigns_reports') }
  let(:current_user)    { double('current_user', id: 1) }

  before do
    allow(Client).to receive(:find_by).with(id: client.id).and_return(client)
  end

  subject { described_class.perform_now(report_ids, current_user.id, client.id) }

  it do
    expect(AssignsReports::BulkExportWithOptions).to receive(:new).with(report_ids, client).and_return(query)
    expect(query).to receive(:query)
    expect(assigns_reports).to receive(:update_all).with(generating: true)
    expect(assigns_reports).to receive(:find_each).and_yield(assigns_report)
    expect(::Reports::ExportJob).to receive(:perform_later).with(assigns_report.id, current_user.id)
    subject
  end

  it 'Client ID is nil' do
    allow(assigns_reports).to receive(:update_all)
    allow(assigns_reports).to receive(:find_each).and_yield(assigns_report)

    expect(Client).to receive(:find_by).with(id: nil).and_return(nil)
    expect(AssignsReports::BulkExportWithOptions).to receive(:new).with(report_ids, nil).and_return(query)
    described_class.perform_now(report_ids, current_user.id, nil)
  end
end
