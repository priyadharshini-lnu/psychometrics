# frozen_string_literal: true

require 'rails_helper'

describe AssignsReports::RegenerateReport do
  let(:user) { create(:user) }
  let(:membership) { create(:membership) }
  let(:assign_report) { create(:assigns_report, :licensed) }

  context 'hogan assigns_report' do
    before do
      allow(assign_report.report).to receive(:hogan?).and_return(true)
      allow(assign_report.report).to receive(:provider_internal?).and_return(false)
    end

    it 'calls Hogan::LoadResultsJob' do
      expect(Hogan::LoadResultsJob).to receive(:perform_later).with(
        assign_report.assign, membership.membership_with_result, membership.project
      )

      described_class.call!(assign_report, user, membership)
    end

    it 'returns report_generatable as true and no incomplete_assessment_names' do
      result = described_class.call!(assign_report, user, membership)

      expect(result).to eq(
        report_generatable: true,
        incomplete_assessment_names: nil
      )
    end
  end

  context 'mindmill assigns_report' do
    before do
      allow(assign_report.report).to receive(:mindmill?).and_return(true)
      allow(assign_report.report).to receive(:provider_internal?).and_return(false)
    end

    it 'calls BuildMindmillResultsJob' do
      expect(BuildMindmillResultsJob).to receive(:perform_later).with(
        assign_report.assign.assign_with_result, membership
      )

      described_class.call!(assign_report, user, membership)
    end

    it 'returns report_generatable as true and no incomplete_assessment_names' do
      result = described_class.call!(assign_report, user, membership)

      expect(result).to eq(
        report_generatable: true,
        incomplete_assessment_names: nil
      )
    end
  end

  context 'internal report' do
    before do
      allow(assign_report.report).to receive(:provider_internal?).and_return(true)
    end

    it 'calls AssignsReports::GenerateReport' do
      expect(AssignsReports::GenerateReport).to receive(:call!).with(assign_report, user)

      described_class.call!(assign_report, user, membership)
    end

    it 'returns incomplete_assessment_names if reports are not generatable' do
      incomplete_assessments = create_list(:assessment, 2)
      allow(AssignsReports::GenerateReport).to receive(:call!).
        and_return(AssignsReports::GenerateReport::NONE_SUCCESSFULL)
      allow_any_instance_of(Reports::IncompleteAssignsQuery).to receive(:query).
        and_return(double(pluck: incomplete_assessments.map(&:id)))

      result = described_class.call!(assign_report, user, membership)

      expect(result).to eq(
        report_generatable: false,
        incomplete_assessment_names: incomplete_assessments.map(&:name).join(', ')
      )
    end
  end
end
