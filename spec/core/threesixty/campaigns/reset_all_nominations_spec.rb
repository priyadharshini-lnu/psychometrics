# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Campaigns::ResetAllNominations do
  let(:threesixty_campaign) { create(:threesixty_campaign) }
  let(:subject) { create(:threesixty_subject, campaign: threesixty_campaign.campaign) }
  let(:evaluator1) { create(:threesixty_evaluator, campaign: threesixty_campaign.campaign) }
  let(:evaluator2) { create(:threesixty_evaluator, campaign: threesixty_campaign.campaign) }

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
    it 'deletes participants records' do
      expect(Threesixty::Participant.where(id: @participants.map(&:id))).to_not exist
    end
  end

  def create_participant(subject, evaluator, campaign)
    create(:threesixty_participant, subject: subject, evaluator: evaluator, campaign: campaign)
  end
end
