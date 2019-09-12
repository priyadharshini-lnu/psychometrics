# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Participants::GetStatus do
  let(:subject) { create(:threesixty_subject) }
  let(:evaluator) { create(:threesixty_evaluator, user_id: subject.user_id) }
  let(:manager_relationship) { create(:relationship, name: 'manager') }
  let(:peer_relationship) { create(:relationship, name: 'peer') }
  let(:nomination_requirement) do
    create(:threesixty_nomination_requirement, conditions: [
             { 'relationship_id' => manager_relationship.id, 'value' => '4' },
             { 'relationship_id' => peer_relationship.id, 'value' => '5' }
           ])
  end

  it 'nomination requirements are valid and evaluations are completed' do
    expect(described_class.call!(
             subject,
             nomination_requirement,
             { completed_evaluations: 4, total_evaluations: 4 },
             manager_relationship.id => 4, peer_relationship.id => 5
           )).to eq Threesixty::Participants::GetStatus::COMPLETED
  end

  it 'nomination requirements are not valid and evaluations are completed' do
    expect(described_class.call!(
             subject,
             nomination_requirement,
             { completed_evaluations: 4, total_evaluations: 4 },
             manager_relationship.id => 3, peer_relationship.id => 5
           )).to eq Threesixty::Participants::GetStatus::NOT_COMPLETED
  end

  it 'nomination requirements are valid and evaluations are not completed' do
    expect(described_class.call!(
             subject,
             nomination_requirement,
             { completed_evaluations: 3, total_evaluations: 4 },
             manager_relationship.id => 4, peer_relationship.id => 5
           )).to eq Threesixty::Participants::GetStatus::NOT_COMPLETED
  end

  it 'subject evaluation status is completed' do
    allow(subject).to receive(:evaluation_status_completed?).and_return(true)

    expect(described_class.call!(
             subject,
             nomination_requirement,
             { completed_evaluations: 3, total_evaluations: 4 },
             manager_relationship.id => 4, peer_relationship.id => 5
           )).to eq Threesixty::Participants::GetStatus::DONE
  end
end
