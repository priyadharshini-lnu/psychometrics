# frozen_string_literal: true

require 'rails_helper'

describe ::Clients::Reports::RemoveReport do
  let(:campaign) { create(:campaign_base, :with_reports) }
  let(:report) { campaign.clients_reports.first.report }
  let(:assessment) { campaign.assessments_clients.first.assessment }
  let(:assessments) { campaign.assessments }
  let(:report_family) { report.report_families.first }
  let(:report_ids) { campaign.reports.ids }
  let(:removing_report_ids) { [] }
  let(:removing_user_access_report_ids) { [] }
  let(:is_applying_to_existing_users) { false }

  subject do
    described_class.call(campaign, removing_report_ids: removing_report_ids,
                                           removing_user_access_report_ids: removing_user_access_report_ids,
                                           is_applying_to_existing_users: is_applying_to_existing_users)
  end

  context '#remove_reports_from_client' do
    it 'dont evoke if remove_report_ids is blank' do
      campaign
      expect { subject }.not_to(change { ClientsReport.count })
    end
    context 'passed removing_report_ids' do
      let(:removing_report_ids) { [report.id] }
      let(:new_report) { create(:report, assessment: assessment, assessments: [], report_families: [report_family]) }

      it 'removes reports and assessments' do
        expect { subject }.to change { campaign.clients_reports.count }.by(-1)
        expect(campaign.assessments_clients.count).to eq(10)
      end
    end
  end
end
