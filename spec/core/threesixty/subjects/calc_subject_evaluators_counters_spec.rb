# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Subjects::CalcSubjectEvaluatorsCounters do
  let(:project) { create(:project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:threesixty_campaign) { create(:threesixty_campaign, campaign: campaign) }
  let(:threesixty_campaign_with_custom_options) { create(:threesixty_campaign, campaign: campaign) }
  let!(:threesixty_option) { create(:threesixty_option, threesixty_campaign: threesixty_campaign) }
  let!(:threesixty_custom_option) do
    create(:threesixty_option,
           threesixty_campaign: threesixty_campaign_with_custom_options,
             participants: { 'manager' => { 'can_approves_evaluations' => true } })
  end
  let(:relationship_manager) { create(:relationship, name: 'Manager', type: 0) }
  let(:relationship_peer) { create(:relationship, name: 'Peer', type: 0) }
  let(:first_subject) { create(:threesixty_subject, user: create(:user, project: project), campaign: campaign) }
  let(:second_subject) { create(:threesixty_subject, user: create(:user, project: project), campaign: campaign) }
  let(:evaluator_user) { create(:user, project: project) }

  before do
    create(:threesixty_participant,
           campaign: campaign, relationship: relationship_manager, project: project, subject: first_subject.user)
    create(:threesixty_participant,
           campaign: campaign, manager_evaluation_status: :approved, relationship: relationship_manager,
           project: project, subject: second_subject.user)
    create(:threesixty_participant,
           campaign: campaign, manager_evaluation_status: :approved, relationship: relationship_peer,
           project: project, subject: first_subject.user)
    create(:threesixty_participant,
           campaign: campaign, manager_evaluation_status: :approved, relationship: relationship_peer,
           project: project, subject: second_subject.user)
    create(:threesixty_participant,
           campaign: campaign, manager_evaluation_status: :approved, relationship: relationship_peer,
           evaluator: evaluator_user, project: project, subject: first_subject.user,
           status: :completed,
           users_result: create(:users_result, without_user_assessment: true))
    create(:threesixty_participant,
           campaign: campaign, manager_evaluation_status: :approved, relationship: relationship_peer,
           evaluator: evaluator_user, project: project, subject: second_subject.user,
           manager_nomination_status: :denied)
  end

  it 'manager should not approve evaluations' do
    counters = described_class.call!([first_subject.user_id, second_subject.user_id, 111], threesixty_campaign)
    expect(counters[first_subject.user_id][:all]).to eq(relationship_manager.id => 1, relationship_peer.id => 2)
    expect(counters[second_subject.user_id][:all]).to eq(relationship_manager.id => 1, relationship_peer.id => 1)
    expect(counters[first_subject.user_id][:completed]).to eq(relationship_peer.id => 1)
  end

  it do
    counters = described_class.call!(
      [first_subject.user_id, second_subject.user_id], threesixty_campaign_with_custom_options
    )
    expect(counters[first_subject.user_id][:completed]).to eq(relationship_peer.id => 2)
    expect(counters[second_subject.user_id][:completed]).to eq(relationship_manager.id => 1, relationship_peer.id => 1)
  end
end
