require 'rails_helper'

describe Queries::Reports::SubProjectLevel::BulkReportWithOptions do
  let(:query) { Queries::Reports::SubProjectLevel::BulkReportWithOptions }

  let(:report_family1) { create(:report_family) }
  let(:report_family2) { create(:report_family) }

  let(:sub_campaign1) { create(:sub_campaign, report_families: [report_family1]) }
  let(:sub_campaign2) { create(:sub_campaign, report_families: [report_family2]) }

  let(:assessment1) { create(:assessment) }
  let(:assessment2) { create(:assessment) }

  let(:report1) { create(:report, assessment: assessment1, report_families: [report_family1]) }
  let(:report2) { create(:report, assessment: assessment2, report_families: [report_family2]) }

  let!(:clients_report1) { create(:clients_report, client: sub_campaign1, report: report1) }
  let!(:clients_report2) { create(:clients_report, client: sub_campaign2, report: report2) }

  let!(:project_clients_report1) { create(:clients_report, client: sub_campaign1.project, report: report1) }
  let!(:project_clients_report2) { create(:clients_report, client: sub_campaign2.project, report: report2) }

  let(:membership1) { create(:membership, client: sub_campaign1) }
  let(:membership2) { create(:membership, client: sub_campaign2) }

  let(:assign_attrs) { {started_at: DateTime.current, completed_at: DateTime.current, status: :completed} }
  let!(:assign1) { create(:assign, assign_attrs.merge(assessment: assessment1, membership: membership1)) }
  let!(:assign2) { create(:assign, assign_attrs.merge(assessment: assessment2, membership: membership2)) }

  let!(:license1) { create(:license, client: membership1.client.root, used_number: 0, report_family: report_family1) }
  let!(:license2) { create(:license, client: membership2.client.root, used_number: 0, report_family: report_family2) }

  let!(:assigns_report1) { create(:assigns_report, assign: assign1, report: report1) }
  let!(:assigns_report2) { create(:assigns_report, assign: assign2, report: report2) }

  context 'for sub_campaign1' do
    let(:result) { query.call(sub_campaign1.id, report1.id, DateTime.current - 1.month, DateTime.current).to_a }

    it 'includes report from sub_campaign1' do
      expect(result).to include(report1)
    end

    it 'does not include report from sub_campaign2' do
      expect(result).not_to include(report2)
    end
  end
end
