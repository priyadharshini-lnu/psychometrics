require 'rails_helper'

describe Queries::Reports::ProjectLevel::BulkReportWithOptions do
  let(:query) { Queries::Reports::ProjectLevel::BulkReportWithOptions }

  let(:report_family1) { create(:report_family) }
  let(:report_family2) { create(:report_family) }

  let(:project1) { create(:project, report_families: [report_family1]) }
  let(:project2) { create(:project, report_families: [report_family2]) }

  let(:assessment1) { create(:assessment) }
  let(:assessment2) { create(:assessment) }

  let(:report1) { create(:report, assessment: assessment1, report_families: [report_family1]) }
  let(:report2) { create(:report, assessment: assessment2, report_families: [report_family2]) }

  let!(:clients_report1) { create(:clients_report, client: project1, report: report1) }
  let!(:clients_report2) { create(:clients_report, client: project2, report: report2) }

  let(:membership1) { create(:membership, client: project1) }
  let(:membership2) { create(:membership, client: project2) }

  let(:assign_attrs) { {started_at: DateTime.current, completed_at: DateTime.current, status: :completed} }
  let!(:assign1) { create(:assign, assign_attrs.merge(assessment: assessment1, membership: membership1)) }
  let!(:assign2) { create(:assign, assign_attrs.merge(assessment: assessment2, membership: membership2)) }

  let!(:license1) { create(:license, client: membership1.client.root, used_number: 0, report_family: report_family1) }
  let!(:license2) { create(:license, client: membership2.client.root, used_number: 0, report_family: report_family2) }

  let!(:assigns_report1) { create(:assigns_report, assign: assign1, report: report1) }
  let!(:assigns_report2) { create(:assigns_report, assign: assign2, report: report2) }

  let(:result) { query.call(project1.id, report1.id, DateTime.current - 1.month, DateTime.current).to_a }

  it 'includes report from the current project' do
    expect(result).to include(report1)
  end

  it 'does not include report from the other project' do
    expect(result).not_to include(report2)
  end
end
