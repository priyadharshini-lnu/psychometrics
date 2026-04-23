# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'UserAssessments Proctoring Commands' do
  include ActiveSupport::Testing::TimeHelpers

  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:user) { create(:user) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:assessment) { create(:assessment, project: project) }
  let(:campaign_assessment) { create(:campaign_assessment, campaign: campaign, assessment: assessment) }
  let(:user_assessment) do
    create(:user_assessment, campaign_user: campaign_user, assessment: assessment, campaign: campaign)
  end

  let(:examus_session_url) { 'https://examus.net/integration/simple/test/start/?token=token' }

  describe UserAssessments::Begin do
    context 'timer logic' do
      before do
        assessment.update(extra: { 'timer' => 60 * 60 }) # 60 minutes standard (seconds)
      end
      context 'when proctoring is enabled' do
        before do
          campaign.campaign_options.update(proctoring_enabled: true, selective_proctoring_enabled: true)
          campaign_assessment.update(proctoring_enabled: true)
        end

        it 'sets expiry_date based on assessment timer' do
          freeze_time do
            described_class.call(user_assessment)
            user_assessment.reload
            # 60 minutes standard
            expect(user_assessment.expiry_date).to be_within(1.second).of(60.minutes.from_now)
          end
        end
      end

      context 'when proctoring is disabled' do
        before do
          campaign_assessment.update(proctoring_enabled: false)
        end

        it 'sets expiry_date based on assessment timer' do
          freeze_time do
            described_class.call(user_assessment)
            user_assessment.reload
            # 60 minutes standard
            expect(user_assessment.expiry_date).to be_within(1.second).of(60.minutes.from_now)
          end
        end
      end
    end
  end
end
