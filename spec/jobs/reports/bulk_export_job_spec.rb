require 'rails_helper'

describe Reports::BulkExportJob do
  let(:client)          { create(:project) }
  let(:report)          { create(:report) }
  let(:report_ids)      { [report.id] }
  let(:assign)          { create(:assign, membership: membership, status: :completed) }
  let(:membership)      { create(:membership, client: client) }
  let!(:assigns_report)  { create(:assigns_report, :licensed, report: report, assign: assign) }
  let(:current_user)    { create(:user) }

  subject { described_class.perform_now(report_ids, current_user, client) }

  it do
    expect{ subject }.to change { assigns_report.reload.generating? }.from(false).to(true)
  end

  it do
    expect(::Reports::ExportJob).to receive(:perform_later).with(assigns_report, current_user)
    subject
  end
end
