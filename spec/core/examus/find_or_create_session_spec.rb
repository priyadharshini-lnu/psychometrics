# frozen_string_literal: true

require 'rails_helper'

describe Examus::FindOrCreateSession do
  let(:campaign_user) { create(:campaign_user, started_at: Time.zone.now) }
  let(:proctoring_license) { create(:proctoring_license) }

  context 'with enough License' do
    it "creates proctoring_session if it already doesn't exists" do
      expect(campaign_user.campaign).to receive(:proctoring_license_with_enough_credits).and_return(proctoring_license)
      expect(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).and_return(30)
      expect(campaign_user.proctoring_sessions).to be_blank
      proctoring_session = described_class.call!(campaign_user)
      expect(proctoring_session).to_not eq(nil)
      expect(proctoring_session.started_at).to_not eq(nil)
      expect(proctoring_session.session_id).to_not eq(nil)
    end

    it 'creates proctoring_session if current_proctoring session is finished' do
      expect(campaign_user.campaign).to receive(:proctoring_license_with_enough_credits).and_return(proctoring_license)
      expect(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).and_return(30)
      campaign_user.proctoring_sessions.create
      expect(Examus::GetSession).to receive(:call!).and_return({ 'status' => 'finished' })
      expect { described_class.call!(campaign_user) }.to change { ProctoringSession.count }.by(1)
    end

    it 'returns existing proctoring session if it is alive' do
      campaign_user.proctoring_sessions.create
      expect(Examus::GetSession).to receive(:call!).and_return({ 'status' => 'started' })
      expect { described_class.call!(campaign_user) }.to_not change(ProctoringSession, :count)
    end

    it "doesn't call examus api to check proctoring session status if session is completed" do
      campaign_user.proctoring_sessions.create(completed_at: Time.zone.now)
      expect(Examus::GetSession).to_not receive(:call!)
      described_class.call!(campaign_user)
    end

    it "doesn't call examus api to check proctoring session status if session is invalid" do
      campaign_user.proctoring_sessions.create(invalid_session: true)
      expect(Examus::GetSession).to_not receive(:call!)
      described_class.call!(campaign_user)
    end

    it "deducts license if it's not a proctoring_trial session" do
      expect(campaign_user.campaign).to receive(:proctoring_license_with_enough_credits).and_return(proctoring_license)
      expect(Campaigns::Proctoring::GetProctoringCredits).to receive(:call!).and_return(30)
      expect { described_class.call!(campaign_user) }.to change(LicenseUsage, :count).by(1)
    end

    it "doesn't deduct license if it's a proctoring_trial session" do
      expect(campaign_user.campaign).to receive(:proctoring_license_with_enough_credits).and_return(proctoring_license)
      campaign_user.campaign.campaign_options.update(proctoring_trial: true)

      expect { described_class.call!(campaign_user) }.to_not change(LicenseUsage, :count)
    end
  end

  context 'without enough license credits' do
    it 'returns error if there are not license credit' do
      error = described_class.call(campaign_user)[:error]

      expect(error).to eq(I18n.t('licenses.not_enough_proctoring_credits'))
    end
  end
end
