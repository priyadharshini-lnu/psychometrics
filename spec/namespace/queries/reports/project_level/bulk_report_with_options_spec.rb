# frozen_string_literal: true

require 'rails_helper'

describe Queries::Reports::ProjectLevel::BulkReportWithOptions do
  let(:query) { Queries::Reports::ProjectLevel::BulkReportWithOptions }

  let(:project1) { create(:project, :with_reports) }
  let(:project2) { create(:project, :with_reports) }

  let(:report_family1) { project1.root.report_families.take }
  let(:report_family2) { project2.root.report_families.take }

  let(:assessment1) { project1.assessments.take }
  let(:assessment2) { project2.assessments.take }

  let(:report1) { assessment1.reports.take }
  let(:report2) { assessment2.reports.take }

  let!(:clients_report1) { create(:clients_report, client: project1, report: report1) }
  let!(:clients_report2) { create(:clients_report, client: project2, report: report2) }

  let(:membership1) { create(:membership, client: project1) }
  let(:membership2) { create(:membership, client: project2) }

  let(:assign_attrs) { { started_at: DateTime.current, completed_at: DateTime.current, status: :completed } }
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
