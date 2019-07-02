# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::SubjectSerializer do
  describe 'subject is also evaluator' do
    let(:user) { create(:user, email: 'dustin@poirier.com') }
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:option) { create(:threesixty_option, participants: { 'manager' => { 'can_approves_evaluations' => true } }) }
    let(:subject) do
      create(:threesixty_subject, user: user, campaign: campaign)
    end
    let!(:evaluator) do
      create(:threesixty_evaluator, user: user, campaign: campaign)
    end
    let(:counters) do
      {
        subject.user_id => { total_evaluators: 5, total_evaluations: 5, completed_evaluations: 3, completed_evaluators: 4 }
      }
    end
    before do
      allow(Threesixty::Reports::IsAvailable).to receive(:call!).and_return(true)
    end

    it do
      result = described_class.new(subject, option: option, counters: counters).to_hash
      expect(result[:evaluators]).to eq '4 / 5'
      expect(result[:report_status]).to eq 'incomplete'
      expect(result[:evaluations]).to eq '3 / 5'
      expect(result[:user][:email]).to eq 'dustin@poirier.com'
    end
  end
  describe 'subject is not evaluator' do
    let(:user) { create(:user, email: 'dustin@poirier.com') }
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:option) { create(:threesixty_option, participants: { 'manager' => { 'can_approves_evaluations' => true } }) }
    let(:subject) do
      create(:threesixty_subject, user: user, campaign: campaign, report_approval_status: 2)
    end

    let(:manager_relationship) { create(:relationship, name: 'manager') }
    let(:peer_relationship) { create(:relationship, name: 'peer') }
    let(:nomination_requirement) do
      create(:threesixty_nomination_requirement, conditions: [
               { 'relationship_id' => manager_relationship.id, 'value' => 4 },
               { 'relationship_id' => peer_relationship.id, 'value' => 5 }
             ])
    end
    let(:counters) do
      {
        subject.user_id => { total_evaluators: 5, total_evaluations: 5, completed_evaluations: 3, completed_evaluators: 5 }
      }
    end

    it do
      result = described_class.new(subject, option: option, nomination_requirement: nomination_requirement, counters: counters).to_hash
      expect(result[:evaluators]).to eq '5 / 5'
      expect(result[:report_status]).to eq 'incomplete'
      expect(result[:status]).to eq 'not_completed'
      expect(result[:evaluations]).to eq nil
      expect(result[:user][:email]).to eq 'dustin@poirier.com'
    end
  end
end
