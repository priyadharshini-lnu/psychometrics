# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Campaigns::ResetAllNominations do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:subject) { create(:threesixty_subject, evaluators_count: 2, campaign: threesixty_campaign.campaign) }
  let(:evaluator1) { create(:threesixty_evaluator, evaluations_count: 1, campaign: threesixty_campaign.campaign) }
  let(:evaluator2) { create(:threesixty_evaluator, evaluations_count: 1, campaign: threesixty_campaign.campaign) }

  before do
    @participants = [
      create_participant(
        subject.user,
        evaluator1.user,
        threesixty_campaign.campaign
      ),
      create_participant(
        subject.user,
        evaluator2.user,
        threesixty_campaign.campaign
      )
    ]

    Threesixty::Campaigns::ResetAllNominations.call(threesixty_campaign)
  end

  describe '.call' do
    it 'decrements evaluators_count for subjects' do
      expect(subject.reload.evaluators_count).to eq(0)
    end

    it 'decrements evaluations_count for evaluators' do
      expect(evaluator1.reload.evaluations_count).to eq(0)
      expect(evaluator2.reload.evaluations_count).to eq(0)
    end

    it 'deletes participants records' do
      expect(Threesixty::Participant.where(id: @participants.map(&:id))).to_not exist
    end
  end

  def create_participant(subject, evaluator, campaign)
    create(:threesixty_participant, subject: subject, evaluator: evaluator, campaign: campaign)
  end
end
