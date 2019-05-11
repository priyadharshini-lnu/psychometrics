require 'rails_helper'

describe Queries::Reports::SubProjectLevel::BulkReportWithOptions do
  let(:query) { Queries::Reports::SubProjectLevel::BulkReportWithOptions }

  let(:sub_campaign1) { create(:sub_campaign, :with_reports) }
  let(:sub_campaign2) { create(:sub_campaign, :with_reports) }

  let(:report_family1) { sub_campaign1.root.report_families.take }
  let(:report_family2) { sub_campaign2.root.report_families.take }

  let(:assessment1) { sub_campaign1.assessments.take }
  let(:assessment2) { sub_campaign2.assessments.take }

  let(:report1) { assessment1.reports.take }
  let(:report2) { assessment2.reports.take }

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
