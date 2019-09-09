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
  let(:subject_1) { create(:threesixty_subject, user: create(:user, project: project), campaign: campaign) }
  let(:subject_2) { create(:threesixty_subject, user: create(:user, project: project), campaign: campaign) }
  let(:evaluator_user_1) { create(:user, project: project) }

  before do
    create(:threesixty_participant,
           campaign: campaign, relationship: relationship_manager, project: project, subject: subject_1.user)
    create(:threesixty_participant,
           campaign: campaign, manager_evaluation_status: :approved, relationship: relationship_manager,
           project: project, subject: subject_2.user)
    create(:threesixty_participant,
           campaign: campaign, manager_evaluation_status: :approved, relationship: relationship_peer,
           project: project, subject: subject_1.user)
    create(:threesixty_participant,
           campaign: campaign, manager_evaluation_status: :approved, relationship: relationship_peer,
           project: project, subject: subject_2.user)
    create(:threesixty_participant,
           campaign: campaign, manager_evaluation_status: :approved, relationship: relationship_peer,
           evaluator: evaluator_user_1, project: project, subject: subject_1.user)
    create(:threesixty_participant,
           campaign: campaign, manager_evaluation_status: :approved, relationship: relationship_peer,
           evaluator: evaluator_user_1, project: project, subject: subject_2.user, manager_nomination_status: :denied)
    create(:users_result, evaluator: evaluator_user_1, status: :completed, subject: subject_1.user)
  end

  it 'manager should not approve evaluations' do
    counters = described_class.call!([subject_1.user_id, subject_2.user_id, 111], threesixty_campaign)
    expect(counters[subject_1.user_id][:all]).to eq(relationship_manager.id => 1, relationship_peer.id => 2)
    expect(counters[subject_2.user_id][:all]).to eq(relationship_manager.id => 1, relationship_peer.id => 1)
    expect(counters[subject_1.user_id][:completed]).to eq(relationship_peer.id => 1)
  end

  it do
    counters = described_class.call!([subject_1.user_id, subject_2.user_id], threesixty_campaign_with_custom_options)
    expect(counters[subject_1.user_id][:completed]).to eq(relationship_peer.id => 2)
    expect(counters[subject_2.user_id][:completed]).to eq(relationship_manager.id => 1, relationship_peer.id => 1)
  end
end
