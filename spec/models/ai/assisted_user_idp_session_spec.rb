# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AI::AssistedUserIdpSession, type: :model do
  let(:session) { create(:assisted_user_idp_session) }

  describe '#add_skill_to_checkpoint!' do
    let(:skill_id) { 123 }
    let(:development_actions) { ['Action 1', 'Action 2'] }
    let(:reason) { 'Test reason for skill addition' }
    let(:expected_skill_data) do
      {
        'skill_id' => skill_id,
        'development_actions' => development_actions,
        'reason' => reason
      }
    end

    context 'when checkpoint is nil' do
      before { session.update!(checkpoint: nil) }

      it 'creates a new array with the skill data' do
        session.add_skill_to_checkpoint!(skill_id: skill_id, development_actions: development_actions, reason: reason)
        expect(session.reload.checkpoint).to eq([expected_skill_data])
      end
    end

    context 'when checkpoint is an existing array' do
      let(:existing_skill) do
        {
          'skill_id' => 456,
          'development_actions' => ['Existing action'],
          'reason' => 'Existing reason'
        }
      end

      before do
        session.update!(checkpoint: [existing_skill])
      end

      it 'adds the new skill to the existing array' do
        session.add_skill_to_checkpoint!(skill_id: skill_id, development_actions: development_actions, reason: reason)
        expected_checkpoint = [existing_skill, expected_skill_data]
        expect(session.reload.checkpoint).to eq(expected_checkpoint)
      end

      it 'preserves existing skills' do
        session.add_skill_to_checkpoint!(skill_id: skill_id, development_actions: development_actions, reason: reason)
        checkpoint = session.reload.checkpoint
        expect(checkpoint.first).to eq(existing_skill)
        expect(checkpoint.last).to eq(expected_skill_data)
      end
    end
  end
end
