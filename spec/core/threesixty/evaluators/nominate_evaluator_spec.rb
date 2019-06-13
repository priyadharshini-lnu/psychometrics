# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Evaluators::NominateEvaluator do
  let(:campaign) { create(:threesixty_campaign) }
  let(:user) { create(:user, email: 'exists@a.com', project: campaign.project) }
  let(:subject) { create(:threesixty_subject, campaign: campaign.campaign) }
  let(:peer) { create(:relationship, name: 'Peer') }
  let(:option) { create(:threesixty_option, threesixty_campaign: campaign)}

  describe '.call' do
    before do
      campaign.option = option
    end
    describe 'check with enabled anyone option' do

      before do
        campaign.option.participants = {'subject': {'can_nominate_anyone_not_in_assessment': true}}
        create(:threesixty_evaluator, campaign: campaign.campaign)
        @params = {evaluator_email: 'unexists@a.com', relationship_id: peer.id}
      end

      it 'should returns a new participant' do
        expect(described_class.call!(campaign, subject, @params)).to eq(subject.participants.last)
      end

      it 'should create a new user, evaluator, participation' do
        described_class.call!(campaign, subject, @params)
        user = subject.participants.last.evaluator

        expect(subject.participants.count).to eq(1)
        expect(user.email).to eq('unexists@a.com')
      end

      it 'should create participants with unexisted and existed users' do
        expect(::Users::Regular.exists?(email: 'unexists@a.com')).to eq false
        participant1 = described_class.call!(campaign, subject, {evaluator_email: 'unexists@a.com', relationship_id: peer.id})
        participant2 = described_class.call!(campaign, subject, {evaluator_email: user.email, relationship_id: peer.id})

        expect(subject.participants.count).to eq(2)
        expect(::Users::Regular.exists?(email: 'unexists@a.com')).to eq true
        expect(participant1.evaluator.email).to eq('unexists@a.com')

        new_user = ::Users::Regular.find_by(email: 'unexists@a.com')
        expect(participant1.evaluator_id).to eq(new_user.id)

        expect(participant2.evaluator_id).to eq(user.id)
      end

      it 'should returns an error' do
        described_class.call!(campaign, subject, @params)
        expect(described_class.call(campaign, subject, @params)).to eq({invalid: {evaluator: ["already exists"]}})
        expect(subject.participants.count).to eq(1)
      end

      it 'should returns an error without subject' do
        expect(described_class.call(campaign, nil, @params)).to eq({invalid: {subject: ["is required"]}})
      end

      it 'should returns an error without relationship' do
        expect(described_class.call(campaign, subject, {evaluator_email: 'evaluator@a.com'})).to eq({invalid: {relationship_id:["can't be blank"]}})
      end

      it 'should returns an error without relationship' do
        expect(described_class.call(campaign, subject, {})).to eq({:invalid=>[{:user=>"can not be processed"}]})
      end
    end

    describe 'check with disabled anyone option' do
      before do
        create(:threesixty_evaluator, campaign: campaign.campaign)
        campaign.option.participants = {'subject': {'can_nominate_anyone_not_in_assessment': false}}
      end

      it 'should create a new user, evaluator, participation' do
        params = {evaluator_email: 'unexists@a.com', relationship_id: peer.id}
        expect(described_class.call(campaign, subject, params)).to eq({:invalid=>[{:user=>"can not be processed"}]})
      end

      it 'exists user should be created successed' do
        params = {evaluator_email: 'exists@a.com', relationship_id: peer.id}
        expect(described_class.call!(campaign, subject, params)).to eq(subject.participants.last)
      end
    end
  end
end
