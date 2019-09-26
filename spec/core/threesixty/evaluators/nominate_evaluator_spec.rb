# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Evaluators::NominateEvaluator do
  let(:campaign) { create(:threesixty_campaign) }
  let!(:option) { create(:threesixty_option, threesixty_campaign: campaign) }
  let(:user) { create(:user, email: 'exists@a.com', project: campaign.project) }
  let(:subject) { create(:threesixty_subject, campaign: campaign.campaign) }
  let(:peer) { create(:relationship, name: 'Peer', type: :campaign) }

  describe '.call' do
    describe 'check without user' do
      before do
        @params = { evaluator_email: 'unexists@a.com', relationship_id: peer.id }
      end

      it 'should returns a new participant' do
        expect(described_class.call(
                 threesixty_campaign: campaign, subject: subject, params: @params, nominator: user
               )).to have_key(:ok)
      end

      it 'should create a new user, evaluator, participation' do
        expect(described_class.call(
                 threesixty_campaign: campaign, subject: subject, params: @params, nominator: user
               )).
          to have_key(:ok)
        user = subject.participants.last.evaluator

        expect(subject.participants.count).to eq(1)
        expect(user.email).to eq('unexists@a.com')
      end

      it 'should create participants with unexisted and existed users' do
        expect(::Users::Regular.exists?(email: 'unexists@a.com')).to eq false
        expect(::Users::Regular.exists?(email: user.email)).to eq true
        participant1 = described_class.
                       call!(threesixty_campaign: campaign, subject: subject,
                       params: { evaluator_email: 'unexists@a.com', relationship_id: peer.id }, nominator: user)
        participant2 = described_class.
                       call!(threesixty_campaign: campaign, subject: subject,
                              params: { evaluator_email: user.email, relationship_id: peer.id },
                       nominator: user, evaluator: user)

        expect(subject.participants.count).to eq(2)
        expect(::Users::Regular.exists?(email: 'unexists@a.com')).to eq true
        expect(participant1.evaluator.email).to eq('unexists@a.com')

        new_user = ::Users::Regular.find_by(email: 'unexists@a.com')
        expect(participant1.evaluator_id).to eq(new_user.id)
        expect(participant2.evaluator_id).to eq(user.id)
      end
    end

    describe 'check with existed user' do
      before do
        @params = { evaluator_email: 'exists@a.com', relationship_id: peer.id }
      end

      it 'should returns a new participant' do
        expect(described_class.call(
                 threesixty_campaign: campaign, subject: subject, params: @params, nominator: user, evaluator: user
               )).
          to have_key(:ok)
      end

      it 'should create a new evaluator and participation' do
        expect(subject.participants.count).to eq(0)

        described_class.call!(
          threesixty_campaign: campaign, subject: subject, params: @params, nominator: user, evaluator: user
        )
        participant = subject.participants.last
        user = participant.evaluator

        expect(subject.participants.count).to eq(1)
        expect(participant.relationship).to eq(peer)
        expect(user).to eq(user)
      end
    end
  end
end
