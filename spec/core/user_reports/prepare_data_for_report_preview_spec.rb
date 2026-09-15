# frozen_string_literal: true

require 'rails_helper'

describe UserReports::PrepareDataForReportPreview do
  let(:current_user) { create(:superadmin) }
  let(:user_report) { create(:user_report) }
  let(:report) { user_report.report }

  describe '#report' do
    context 'when the report has a published snapshot' do
      before { Reports::PublishSnapshot.call!(report, current_user) }

      it 'uses the effective (published) report by default' do
        instance = described_class.new(user_report, locale: 'en')

        expect(instance.send(:report)).to be_a(Reports::PublishedReader)
      end

      it 'uses the live draft report when view_draft option is true' do
        instance = described_class.new(user_report, locale: 'en', view_draft: true)

        expect(instance.send(:report)).to be_a(Reports::DraftReader)
      end
    end
  end

  describe '#call' do
    context 'when the report has a published snapshot' do
      before { Reports::PublishSnapshot.call!(report, current_user) }

      it 'computes user_report_data from the draft when view_draft option is true' do
        expect(UserReports::PrepareUserReportData).to receive(:call!).
          with(user_report, view_draft: true).and_return([])

        described_class.call!(user_report, locale: 'en', view_draft: true)
      end

      it 'computes user_report_data from the published snapshot by default' do
        expect(UserReports::PrepareUserReportData).to receive(:call!).
          with(user_report, view_draft: false).and_return([])

        described_class.call!(user_report, locale: 'en')
      end
    end
  end
end
