# frozen_string_literal: true

require 'rails_helper'

describe AssignsReports::GetAllWithSameReportQuery do
  it 'gets assign_reports with same report for a user' do
    allow_any_instance_of(AssignsReport).to receive(:use_license).and_return(nil)
    assign1 = create(:assign, :with_assign_reports)
    assigns_reports = assign1.assigns_reports
    assign2 = create(:assign, membership: assign1.membership, assessment: build(:assessment))
    assign_report_with_same_report = create(:assigns_report, assign: assign2,
      report_id: assigns_reports.first.report_id)

    results = described_class.new(assigns_reports.first).query.to_a

    expect(results).to include(assigns_reports.first)
    expect(results).to include(assign_report_with_same_report)
    expect(results).to_not include(assigns_reports.last)
  end
end
