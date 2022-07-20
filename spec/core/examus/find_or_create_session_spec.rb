# frozen_string_literal: true

require 'rails_helper'

describe Examus::FindOrCreateSession do
  let(:campaign_user) { create(:campaign_user, started_at: Time.now) }

  context 'with enough License' do
    it "creates proctoring_session if it already doesn't exists" do
      expect(Licenses::IsEnoughLicenseCredits).to receive(:call!).and_return(true)
      expect(campaign_user.proctoring_sessions).to be_blank
      proctoring_session = described_class.call!(campaign_user)
      expect(proctoring_session).to_not eq(nil)
      expect(proctoring_session.started_at).to_not eq(nil)
      expect(proctoring_session.session_id).to_not eq(nil)
    end

    it 'creates proctoring_session if current_proctoring session is not alive' do
      expect(Licenses::IsEnoughLicenseCredits).to receive(:call!).and_return(true)
      campaign_user.proctoring_sessions.create
      expect(Examus::IsSessionAlive).to receive(:call!).and_return(false)
      expect { described_class.call!(campaign_user) }.to change { ProctoringSession.count }.by(1)
    end

    it 'returns existing proctoring session if it is alive' do
      campaign_user.proctoring_sessions.create
      expect(Examus::IsSessionAlive).to receive(:call!).and_return(true)
      expect { described_class.call!(campaign_user) }.to_not change(ProctoringSession, :count)
    end
  end

  context 'without enough license credits' do
    it 'returns error if there are not license credit' do
      expect(Licenses::IsEnoughLicenseCredits).to receive(:call!).and_return(false)
      error = described_class.call(campaign_user)[:error]

      expect(error).to eq(I18n.t('licenses.not_enough_proctoring_credits'))
    end
  end
end
