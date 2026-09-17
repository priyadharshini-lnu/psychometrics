# frozen_string_literal: true

require 'rails_helper'

describe UserReports::PrepareUserReportData do
  let(:current_user) { create(:superadmin) }
  let(:user_report) { create(:user_report) }
  let(:report) { user_report.report }

  describe '#report' do
    context 'when the report has a published snapshot' do
      before { Reports::PublishSnapshot.call!(report, current_user) }

      it 'uses the effective (published) report by default' do
        instance = described_class.new(user_report)

        expect(instance.send(:report)).to be_a(Reports::PublishedReader)
      end

      it 'uses the live draft report when view_draft is true' do
        instance = described_class.new(user_report, nil, view_draft: true)

        expect(instance.send(:report)).to be_a(Reports::DraftReader)
      end
    end
  end
end
