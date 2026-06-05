# frozen_string_literal: true

require 'rails_helper'

describe Microsite::CancelParticipantJob do
  let(:project) { create(:project) }
  let(:participant_id) { 'participant-123' }

  describe '#perform' do
    it 'calls CancelParticipant with participant_id and project_id' do
      expect(Microsite::CancelParticipant).to receive(:call).with(
        participant_id: participant_id,
        project_id: project.id
      )

      described_class.new.perform(participant_id: participant_id, project_id: project.id)
    end
  end
end
