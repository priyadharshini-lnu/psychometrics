# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::NominationRequirements::FilledNominations do
  let(:current_user) { create(:user, email: 'daniel@cc.com') }
  let(:campaign) { create(:threesixty_campaign) }
  let(:subject) { create(:threesixty_subject, campaign: campaign.campaign, user: current_user) }
  let(:evaluator) { create(:threesixty_evaluator, campaign: campaign.campaign) }
  let(:evaluator2) { create(:threesixty_evaluator, campaign: campaign.campaign) }
  let(:manager) {create(:relationship, name: 'Manager')}
  let(:peer) {create(:relationship, name: 'Peer')}

  it 'returns 0 for subject without nominations' do
    create(:threesixty_nomination_requirement, threesixty_campaign_id: campaign.id, subject_conditions: [], conditions: [{"value"=>2, "comparator"=>"atleast", "relationship_id"=>manager.id}])
    expect(described_class.call!([subject], campaign)).to eq(0)
  end
  
  it 'returns 0 for subject with 1 nominations' do
    create(:threesixty_nomination_requirement, threesixty_campaign_id: campaign.id, subject_conditions: [], conditions: [{"value"=>2, "comparator"=>"atleast", "relationship_id"=>manager.id}])
    create(:threesixty_participant, evaluator: evaluator.user, subject: subject.user, relationship: manager)
    expect(described_class.call!([subject], campaign)).to eq(0)
  end
  
  it 'returns 1 for subject with filled requirements' do
    create(:threesixty_nomination_requirement, threesixty_campaign_id: campaign.id, subject_conditions: [], conditions: [{"value"=>2, "comparator"=>"atleast", "relationship_id"=>manager.id}])
    create(:threesixty_participant, evaluator: evaluator.user, subject: subject.user, relationship: manager)
    create(:threesixty_participant, evaluator: evaluator2.user, subject: subject.user, relationship: manager)
    expect(described_class.call!([subject], campaign)).to eq(1)
  end


  it 'returns 0 for subject with filled one requirement' do
    create(:threesixty_nomination_requirement, threesixty_campaign_id: campaign.id, subject_conditions: [], conditions: [{"value"=>2, "comparator"=>"atleast", "relationship_id"=>manager.id}, {"value"=>2, "comparator"=>"atleast", "relationship_id"=>peer.id}])
    create(:threesixty_participant, evaluator: evaluator.user, subject: subject.user, relationship: manager)
    create(:threesixty_participant, evaluator: evaluator2.user, subject: subject.user, relationship: manager)
    expect(described_class.call!([subject], campaign)).to eq(0)
  end
end
