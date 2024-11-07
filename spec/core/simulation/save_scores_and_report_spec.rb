# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Simulation::SaveScoresAndReport, type: :service do
  let(:project) { create(:project) }
  let(:assessment) { create(:assessment, :simulation, project: project) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project) }
  let(:service) { described_class.new(user_assessment, retry_count: retry_count) }
  let(:retry_count) { 0 }

  before do
    allow(Simulation::GetDecisions).to receive(:call!).and_return(decisions)
    allow(Simulation::SaveScoresAndReportJob).to receive(:set).and_return(Simulation::SaveScoresAndReportJob)
    allow(Simulation::SaveScoresAndReportJob).to receive(:perform_later)
    allow(service).to receive(:broadcast)
  end

  describe '#call' do
    let(:decisions) do
      {
        'userId' => '22d87cc0-d911-4ca8-9913-1a48520b04c0',
        'decisions' => {
          'wfra_labor' => 60_000,
          'pitchSolution' => {
            'rankings' => {
              '1A' => 2,
              '1B' => 3,
              '1C' => 1,
              '2C1' => 3,
              '2C2' => 2,
              '2C3' => 1,
              '3I1' => 2,
              '3I2' => 3,
              '3I3' => 1
            },
            'takenOptions' => %w[
              1C
              2C3
              3I3
            ]
          },
          'communityNeeds' => %w[
            restorationOfElectricity
            accessToCleanDrinkingWater
            supplyOfLuxuryFoodItems
          ]
        }
      }
    end

    context 'when decisions are present' do
      it 'updates the users_result answers' do
        service.call

        expect(user_assessment.users_result.reload.answers).to eq(
          decisions['decisions']
        )
      end

      it 'updates the user_assessment status to completed' do
        service.call

        expect(user_assessment.reload.status).to eq('completed')
      end

      it 'broadcasts :ok' do
        expect(service).to receive(:broadcast).with(:ok)

        service.call
      end

      it 'calls generate_internal_reports' do
        expect(service).to receive(:generate_internal_reports)

        service.call
      end
    end

    context 'when decisions are blank' do
      let(:decisions) { nil }

      it 'retries saving the decisions' do
        service.call

        expect(Simulation::SaveScoresAndReportJob).to have_received(:set).with(wait: 1.minute)
        expect(Simulation::SaveScoresAndReportJob).to have_received(:perform_later).with(user_assessment,
                                                                                         retry_count: 1)
      end
    end

    context 'when decisions are passed to class' do
      let(:service) { described_class.new(user_assessment, decisions) }

      it 'updates the users_result answers without calling api' do
        service.call

        expect(Simulation::GetDecisions).not_to have_received(:call!)
        expect(user_assessment.users_result.reload.answers).to eq(
          decisions['decisions']
        )
      end
    end
  end
end
