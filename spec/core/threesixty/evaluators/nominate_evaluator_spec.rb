# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Evaluators::NominateEvaluator do
  let(:campaign) { create(:threesixty_campaign) }
  let(:user) { create(:user, email: 'exists@a.com', project: campaign.project) }
  let(:subject) { create(:threesixty_subject, campaign: campaign.campaign) }
  let(:peer) { create(:relationship, name: 'Peer') }
  let(:option) { create(:threesixty_option, threesixty_campaign: campaign)}
  let(:datasheet) { create(:datasheet, project_id: campaign.project.id, columns: {'Age' => 'Number', 'No.' => 'Number'}) }

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
        expect(described_class.call(campaign, subject, @params)).to have_key(:ok)
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
        expect(described_class.call(campaign, subject, @params)).to have_key(:ok)
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

      describe 'with creating from datasheet' do
        before do
          campaign.option.participants = {'subject': {
            'can_nominate_anyone_from_datasheet': true,
            'limit_nomination_by_subject_from_datasheet': true,
            'limit_nomination_by_subject_from_datasheet_criteria': [{"field"=>"Age", "value"=>"55", "comparator"=>"equal"}],
          }}
          create(:datasheet_row, datasheet: datasheet, email: subject.user.email, data: {'Age' => 21, 'No.' => 2})
          create(:datasheet_row, datasheet: datasheet, email: user.email, data: {'Age' => 21, 'No.' => 1})
        end

        it 'should returns error' do
          expect(described_class.call(campaign, subject, {evaluator_email: 'unexists@a.com'})).to eq({:invalid=>[{:user=>"can not be processed"}]})
          expect(subject.participants.count).to eq(0)
        end

        it 'should returns error with falsy criteria' do
          create(:datasheet_row, datasheet: datasheet, email: 'unexists@a.com', data: {'Age' => 21, 'No.' => 1})
          expect(described_class.call(campaign, subject, {evaluator_email: 'unexists@a.com'})).to eq({:invalid=>[{:user=>"can not be processed"}]})
          expect(subject.participants.count).to eq(0)
        end

        it 'should create successed' do
          campaign.option.participants = {'subject': {
            'can_nominate_anyone_from_datasheet': true,
            'limit_nomination_by_subject_from_datasheet': false,
          }}
          create(:datasheet_row, datasheet: datasheet, email: 'unexists@a.com', data: {'Age' => 21, 'No.' => 1})
          expect(described_class.call(campaign, subject, @params)).to have_key(:ok)
          expect(subject.participants.count).to eq(1)
        end

        it 'should create successed with truly criteria' do
          create(:datasheet_row, datasheet: datasheet, email: 'unexists@a.com', data: {'Age' => 55, 'No.' => 1})
          expect(described_class.call(campaign, subject, @params)).to have_key(:ok)
          expect(subject.participants.count).to eq(1)
        end
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

      it 'existed user should be created successed' do
        params = {evaluator_email: user.email, relationship_id: peer.id}
        expect(described_class.call(campaign, subject, params)).to have_key(:ok)
      end
    end
  end
end
