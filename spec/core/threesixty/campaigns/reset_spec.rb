require 'rails_helper'

describe Threesixty::Campaigns::Create do
  let(:threesixty_campaign) { create(:threesixty_campaign) }

  describe '.call' do
    it 'deletes associated nomination_requirements' do
      nomination_requirements = create_list(:threesixty_nomination_requirement, 2, threesixty_campaign_id: threesixty_campaign.id)
      ::Threesixty::Campaigns::Reset.call!(threesixty_campaign)

      expect(::Threesixty::NominationRequirement.find_by(id: nomination_requirements[0])).to be_nil
      expect(::Threesixty::NominationRequirement.find_by(id: nomination_requirements[1])).to be_nil
    end

    it 'deletes associated subjects_requirements' do
      subjects_relationships = create_list(:threesixty_subjects_relationship, 2, campaign: threesixty_campaign.campaign)
      ::Threesixty::Campaigns::Reset.call!(threesixty_campaign)

      expect(::Threesixty::SubjectsRelationship.find_by(id: subjects_relationships[0])).to be_nil
      expect(::Threesixty::SubjectsRelationship.find_by(id: subjects_relationships[1])).to be_nil
    end

    it 'deletes associated participants' do
      participants = create_list(:participant, 2, campaign: threesixty_campaign.campaign)
      ::Threesixty::Campaigns::Reset.call!(threesixty_campaign)

      expect(Participant.find_by(id: participants[0])).to be_nil
      expect(Participant.find_by(id: participants[1])).to be_nil
    end

    it 'deletes associated campaigns_users' do
      campaigns_users = create_list(:campaigns_user, 2, campaign: threesixty_campaign.campaign)
      ::Threesixty::Campaigns::Reset.call!(threesixty_campaign)

      expect(CampaignsUser.find_by(id: campaigns_users[0])).to be_nil
      expect(CampaignsUser.find_by(id: campaigns_users[1])).to be_nil
    end

    it 'deletes associated subjects' do
      subjects = create_list(:threesixty_subject, 2, campaign: threesixty_campaign.campaign)
      ::Threesixty::Campaigns::Reset.call!(threesixty_campaign)

      expect(Threesixty::Subject.find_by(id: subjects[0])).to be_nil
      expect(Threesixty::Subject.find_by(id: subjects[1])).to be_nil
    end

    it 'deletes associated evaluators' do
      evaluators = create_list(:threesixty_evaluator, 2, campaign: threesixty_campaign.campaign)
      ::Threesixty::Campaigns::Reset.call!(threesixty_campaign)

      expect(Threesixty::Evaluator.find_by(id: evaluators[0])).to be_nil
      expect(Threesixty::Evaluator.find_by(id: evaluators[1])).to be_nil
    end
  end
end
