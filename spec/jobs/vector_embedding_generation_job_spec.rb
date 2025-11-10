# frozen_string_literal: true

require 'rails_helper'

RSpec.describe VectorEmbeddingGenerationJob, type: :job do
  describe '#perform' do
    let(:skill) { create(:skill, name: 'Test Skill') }

    context 'when embedding generation is successful' do
      before do
        allow(skill).to receive(:generate_embedding!)
      end

      it 'calls generate_embedding! on the entity' do
        described_class.new.perform(skill)

        expect(skill).to have_received(:generate_embedding!)
      end
    end
  end
end
