# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Simulation::SaveScoresAndReportJob, type: :job do
  let(:project) { create(:project) }
  let(:assessment) { create(:assessment, project: project) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }

  describe '#perform' do
    context 'when retry_count is less than or equal to 5' do
      it 'calls Simulation::SaveScoresAndReport with the correct arguments' do
        expect(Simulation::SaveScoresAndReport).to receive(:call!).with(user_assessment, retry_count: 3)

        described_class.perform_now(user_assessment, retry_count: 3)
      end
    end

    context 'when retry_count is greater than 5' do
      it 'does not call Simulation::SaveScoresAndReport' do
        expect(Simulation::SaveScoresAndReport).not_to receive(:call!)

        described_class.perform_now(user_assessment, retry_count: 6)
      end
    end
  end
end
