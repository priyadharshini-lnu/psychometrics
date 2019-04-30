require 'rails_helper'

describe ::Clients::Reports::RemoveReport do
  let(:campaign) { create(:campaign, :with_reports) }
  let(:report) { campaign.clients_reports.first.report }
  let(:assessment) { campaign.assessments_clients.first.assessment }
  let(:assessments) { campaign.assessments }
  let(:report_family) { report.report_families.first }
  let(:report_ids) { campaign.reports.ids }
  let(:remove_report_ids) { [] }
  let(:remove_user_access_report_ids) { [] }
  let(:apply_to_existing_users) { false }

  subject { described_class.call(campaign, remove_report_ids: remove_report_ids,
                                           remove_user_access_report_ids: remove_user_access_report_ids,
                                           apply_to_existing_users: apply_to_existing_users) }

  context '#remove_reports_from_client'  do
    it 'dont evoke if remove_report_ids is blank' do
      campaign
      expect { subject }.not_to change { ClientsReport.count }
    end
    context 'passed remove_report_ids' do
      let(:remove_report_ids) { [report.id] }
      let(:new_report) { create(:report, assessment: assessment, assessments: [], report_families: [report_family]) }

      it 'removes reports and assessments' do
        expect { subject }.to change { campaign.clients_reports.count }.from(1).to(0)
        expect(campaign.assessments_clients.count).to eq(6)
      end
    end
  end
end
