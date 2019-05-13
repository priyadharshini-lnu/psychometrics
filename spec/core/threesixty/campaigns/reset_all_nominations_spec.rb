require 'rails_helper'

describe Threesixty::Campaigns::ResetAllNominations do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:threesixty_subject) { create(:threesixty_subject, evaluators_count: 2, campaign: threesixty_campaign.campaign) }
  let(:threesixty_evaluator) { create(:threesixty_evaluator, evaluations_count: 2, campaign: threesixty_campaign.campaign) }

  before do
    @participants = create_list(
      :participant,
      2,
      subject: threesixty_subject.user,
      evaluator: threesixty_evaluator.user,
      campaign: threesixty_campaign.campaign
    )
    Threesixty::Campaigns::ResetAllNominations.call(threesixty_campaign)
  end

  describe '.call' do
    it 'decrements evaluators_count for subjects' do
      expect(threesixty_subject.reload.evaluators_count).to eq(0)
    end

    it 'decrements evaluations_count for evaluators' do
      expect(threesixty_evaluator.reload.evaluations_count).to eq(0)
    end

    it 'deletes participants records' do
      expect(Participant.where(id: @participants.map(&:id))).to_not exist
    end
  end
end
