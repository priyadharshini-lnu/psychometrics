require 'rails_helper'

describe Threesixty::Campaigns::Reset do
  let(:threesixty_campaign) { create(:threesixty_campaign) }

  describe '.call' do
    it 'deletes associated nomination_requirements' do
      nomination_requirements = create_list(:threesixty_nomination_requirement, 2, threesixty_campaign_id: threesixty_campaign.id)
      ::Threesixty::Campaigns::Reset.call!(threesixty_campaign)

      expect(::Threesixty::NominationRequirement.where(id: nomination_requirements.map(&:id))).to_not exist
    end

    it 'deletes associated participants' do
      participants = create_list(:threesixty_participant, 2, campaign: threesixty_campaign.campaign)
      ::Threesixty::Campaigns::Reset.call!(threesixty_campaign)

      expect(Threesixty::Participant.where(id: participants.map(&:id))).to_not exist
    end

    it 'deletes associated campaigns_users' do
      campaigns_users = create_list(:campaigns_user, 2, campaign: threesixty_campaign.campaign)
      ::Threesixty::Campaigns::Reset.call!(threesixty_campaign)

      expect(CampaignsUser.where(id: campaigns_users.map(&:id))).to_not exist
    end

    it 'deletes associated subjects' do
      subjects = create_list(:threesixty_subject, 2, campaign: threesixty_campaign.campaign)
      ::Threesixty::Campaigns::Reset.call!(threesixty_campaign)

      expect(Threesixty::Subject.where(id: subjects.map(&:id))).to_not exist
    end

    it 'deletes associated evaluators' do
      evaluators = create_list(:threesixty_evaluator, 2, campaign: threesixty_campaign.campaign)
      ::Threesixty::Campaigns::Reset.call!(threesixty_campaign)

      expect(Threesixty::Evaluator.where(id: evaluators.map(&:id))).to_not exist
    end
  end
end
