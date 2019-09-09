# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::CreateAll do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }

  before do
    allow(Licenses::CreateThreesixtySubject).to receive(:use).and_return(true)

    user = create(:user, project: project, email: 'fedor@gmail.com')
    create(:campaigns_user, user: user, campaign: campaign)
    create(:threesixty_subject, user: user, campaign: campaign)
    create(:relationship, name: 'Self')
  end

  describe '.call' do
    it 'duplicated emails' do
      result = described_class.
               call!([{ email: 'dev.atanov@gmail.com' }, { email: 'fedor@gmail.com' }], threesixty_campaign)
      expect(result[:subjects].map { |s| s.user.email }).to match_array(%w[fedor@gmail.com dev.atanov@gmail.com])
    end

    it 'updates existing user record' do
      user = create(:user, project: threesixty_campaign.project, email: 'daniel@cc.com', first_name: 'Daniel')
      create(:threesixty_subject, user: user, campaign: threesixty_campaign.campaign)

      result = described_class.call!([{ email: 'daniel@cc.com', first_name: 'Dan' }], threesixty_campaign)

      expect(user.reload.first_name).to eq('Dan')
    end

    it "doesn't create new subject record when subject exists" do
      user = create(:user, project: threesixty_campaign.project, email: 'daniel@cc.com', first_name: 'Daniel')
      create(:threesixty_subject, user: user, campaign: threesixty_campaign.campaign)

      expect do
        described_class.call!([{ email: 'daniel@cc.com', first_name: 'Dan' }], threesixty_campaign)
      end.to_not change(::Threesixty::Subject, :count)
    end

    it "doesn't create participants if already exists" do
      user = create(:user, project: threesixty_campaign.project, email: 'daniel@cc.com', first_name: 'Daniel')
      subject = create(:threesixty_subject, user: user, campaign: threesixty_campaign.campaign)
      create(
        :threesixty_participant,
        campaign_id:  threesixty_campaign.campaign_id,
        subject_id: subject.user_id,
        evaluator_id: subject.user_id
      )

      expect do
        described_class.call!([{ email: 'daniel@cc.com', first_name: 'Dan' }], threesixty_campaign)
      end.to_not change(::Threesixty::Participant, :count)
    end

    it 'saves new user with the provides password' do
      result = described_class.call!([{ email: 'daniel@cc.com', password: 'provided_password' }], threesixty_campaign)
      user = result[:subjects].first.user

      expect(user.reload.valid_password?('provided_password')).to eq(true)
    end

    it "doesn't update password for existing used" do
      user = create(:user, project: threesixty_campaign.project, email: 'daniel@cc.com', password: 'old_password')
      create(:threesixty_subject, user: user, campaign: threesixty_campaign.campaign)

      result = described_class.call!([{ email: 'daniel@cc.com', password: 'new_password' }], threesixty_campaign)

      expect(user.reload.valid_password?('old_password')).to eq(true)
    end

    it do
      result = described_class.
               call!([{ email: 'dev.atanov@gmail.com' }, { email: 'fedor@gmail.com' }], threesixty_campaign)
      participants = Threesixty::Participant.all
      expect(result[:subjects].map { |s| s.user.email }).to match_array(%w[fedor@gmail.com dev.atanov@gmail.com])
      expect(participants.map { |s| s.evaluator.email }).to match_array(%w[fedor@gmail.com dev.atanov@gmail.com])
      expect(participants.map { |s| s.subject.email }).to match_array(%w[fedor@gmail.com dev.atanov@gmail.com])
    end
  end
end
