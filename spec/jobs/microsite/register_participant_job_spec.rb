# frozen_string_literal: true

require 'rails_helper'

describe Microsite::RegisterParticipantJob do
  let(:project) { create(:project) }
  let(:assessment) { create(:assessment, :microsite, project: project) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }

  describe '#perform' do
    context 'when user_assessment exists and is microsite type' do
      it 'calls RegisterParticipant with the user_assessment' do
        expect(Microsite::RegisterParticipant).to receive(:call!).with(user_assessment)
        described_class.new.perform(user_assessment.id)
      end
    end

    context 'when user_assessment does not exist' do
      it 'does not call RegisterParticipant' do
        expect(Microsite::RegisterParticipant).not_to receive(:call!)
        described_class.new.perform(-1)
      end
    end

    context 'when user_assessment is not microsite type' do
      let(:non_microsite_assessment) { create(:assessment, project: project) }
      let(:non_microsite_ua) { create(:user_assessment, assessment: non_microsite_assessment, project: project) }

      it 'does not call RegisterParticipant' do
        expect(Microsite::RegisterParticipant).not_to receive(:call!)
        described_class.new.perform(non_microsite_ua.id)
      end
    end
  end
end
