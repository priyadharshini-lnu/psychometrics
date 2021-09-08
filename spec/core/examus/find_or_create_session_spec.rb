# frozen_string_literal: true

require 'rails_helper'

describe Examus::FindOrCreateSession do
  let(:campaign_user) { create(:campaign_user, started_at: Time.now) }

  it "creates proctoring_session if it already doesn't exists" do
    expect(campaign_user.proctoring_sessions).to be_blank
    proctoring_session, type = described_class.call!(campaign_user)
    expect(proctoring_session).to_not eq(nil)
    expect(type).to_not eq(:new)
    expect(proctoring_session.started_at).to_not eq(nil)
    expect(proctoring_session.session_id).to_not eq(nil)
  end

  it 'creates proctoring_session if current_proctoring session is not alive' do
    campaign_user.proctoring_sessions.create
    expect(Examus::IsSessionAlive).to receive(:call!).and_return(false)
    expect { described_class.call!(campaign_user) }.to change { ProctoringSession.count }.by(1)
  end

  it 'returns existing proctoring sesssion if it is alive' do
    campaign_user.proctoring_sessions.create
    expect(Examus::IsSessionAlive).to receive(:call!).and_return(true)
    expect { described_class.call!(campaign_user) }.to_not change(ProctoringSession, :count)
  end
end
