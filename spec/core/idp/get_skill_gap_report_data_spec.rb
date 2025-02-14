# frozen_string_literal: true

require 'rails_helper'

describe Idp::GetSkillGapReportData do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:report) { create(:report, name: 'Skill gap report') }
  let!(:report_family) { create(:report_family, reports: [report]) }
  let!(:idp_template) { create(:idp_template, report: report) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign, idp_template: idp_template) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:user_report) { create(:user_report, user: user, report: report, campaign: campaign, status: :prepared) }

  describe '#call' do
    context 'when fetching skill gap report data' do
      it 'returns serialized skill gap report data' do
        result = described_class.call!(user)

        expect(result).to include(
          'id' => user_report.id,
          'campaign_id' => campaign.id,
          'status' => user_report.status,
          'is_self' => false
        )

        expect(result['user']).to include(
          'id' => user.id
        )
      end

      it 'includes report data' do
        result = described_class.call!(user)

        expect(result['report']).to include(
          'id' => report.id,
          'name' => 'Skill gap report'
        )
      end
    end

    context 'when user does not have an active IDP plan' do
      before do
        user_idp_plan.update!(active: false)
      end

      it 'raise an error' do
        res = described_class.call(user)

        expect(res[:error].first[:base]).to eq(I18n.t('errors.user_idp_plan.no_active_plan'))
      end
    end

    context 'when user does not have an active IDP plan with report associated with idp template' do
      before do
        idp_template.update!(report: nil)
        user_report.destroy!
      end

      it 'raise not found error' do
        res = described_class.call(user)

        expect(res[:error].first[:base]).to eq(I18n.t('errors.skill_gap_report.not_found'))
      end
    end

    context 'when user skill gap report is not prepared' do
      before do
        user_report.update!(status: :not_prepared)
      end

      it 'raise not found error' do
        res = described_class.call(user)

        expect(res[:error].first[:base]).to eq(I18n.t('errors.skill_gap_report.not_found'))
      end
    end
  end
end
