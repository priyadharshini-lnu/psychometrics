# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::Participants::GetStatus do
  let(:subject) { create(:threesixty_subject) }
  let(:evaluator) { create(:threesixty_evaluator, user_id: subject.user_id) }
  let(:option_which_requires_approval) { create(:threesixty_option, participants: { requires_approval: true }) }
  let(:option_which_does_not_require_approval) { create(:threesixty_option) }
  let(:manager_relationship) { create(:relationship, name: 'manager') }
  let(:peer_relationship) { create(:relationship, name: 'peer') }
  let(:nomination_requirement) do
    create(:threesixty_nomination_requirement, conditions: [
             { 'relationship_id' => manager_relationship.id, 'value' => 4 },
             { 'relationship_id' => peer_relationship.id, 'value' => 5 }
           ])
  end

  describe 'evaluator does not have related subject' do
    describe 'completed_evaluations_count < evaluations_count' do
      let(:evaluator) { create(:threesixty_evaluator, completed_evaluations_count: 1, evaluations_count: 2) }

      it { expect(described_class.call!(evaluator, nil, option_which_requires_approval, nil)).to eq 'not_completed' }
    end
    describe 'without approval requiring' do
      let(:evaluator) { create(:threesixty_evaluator, completed_evaluations_count: 2, evaluations_count: 2) }

      it { expect(described_class.call!(evaluator, nil, option_which_does_not_require_approval, nil)).to eq 'completed' }
    end
    describe 'with approval requiring' do
      let(:evaluator) { create(:threesixty_evaluator, completed_evaluations_count: 2, evaluations_count: 2) }

      it { expect(described_class.call!(evaluator, nil, option_which_requires_approval, nil)).to eq 'not_completed' }
    end
  end

  describe 'evaluator has related subject' do
    before do
      create(:threesixty_subjects_relationship, relationship: create(:relationship))
      create(:threesixty_subjects_relationship, relationship: create(:relationship))
    end
    describe 'with approval requiring' do
      let(:evaluator) { create(:threesixty_evaluator, completed_evaluations_count: 2, evaluations_count: 2) }

      it { expect(described_class.call!(evaluator, evaluator.subject, option_which_requires_approval, nomination_requirement)).to eq 'not_completed' }
    end
  end

  describe '#valid_nomination_requirements?' do

    describe 'nomination_requirement does not exist' do
      it do
        expect(described_class.new(evaluator, evaluator.subject, nil, nil).valid_nomination_requirements?).to eq true
      end
    end

    describe 'requires_approval = true and nomination requirements are not matched' do
      before do
        create(:threesixty_subjects_relationship, relationship: manager_relationship, subject: subject.user, completed_evaluators_count: 5, approved_evaluators_count: 4)
        create(:threesixty_subjects_relationship, relationship: peer_relationship, subject: subject.user, completed_evaluators_count: 5, approved_evaluators_count: 4)
      end
      it do
        expect(described_class.new(evaluator, evaluator.subject, option_which_requires_approval, nomination_requirement).valid_nomination_requirements?).to eq false
      end
    end


    describe 'requires_approval = true and nomination requirements are matched' do
      before do
        create(:threesixty_subjects_relationship, relationship: manager_relationship, subject: subject.user, completed_evaluators_count: 5, approved_evaluators_count: 5)
        create(:threesixty_subjects_relationship, relationship: peer_relationship, subject: subject.user, completed_evaluators_count: 5, approved_evaluators_count: 5)
      end
      it do
        expect(described_class.new(evaluator, evaluator.subject, option_which_requires_approval, nomination_requirement).valid_nomination_requirements?).to eq true
      end
    end

    describe 'requires_approval = false and nomination requirements are matched' do
      before do
        create(:threesixty_subjects_relationship, relationship: manager_relationship, subject: subject.user, completed_evaluators_count: 5, approved_evaluators_count: 4)
        create(:threesixty_subjects_relationship, relationship: peer_relationship, subject: subject.user, completed_evaluators_count: 5, approved_evaluators_count: 4)
      end
      it do
        expect(described_class.new(evaluator, evaluator.subject, option_which_does_not_require_approval, nomination_requirement).valid_nomination_requirements?).to eq true
      end
    end
  end
end
