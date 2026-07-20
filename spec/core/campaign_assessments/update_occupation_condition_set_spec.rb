# frozen_string_literal: true

require 'rails_helper'

describe CampaignAssessments::UpdateOccupationConditionSet, type: :command do
  let(:dimension) { create(:dimension, occupations_enabled: true) }
  let(:assessment) { create(:assessment, dimension: dimension) }
  let(:campaign_assessment) { create(:campaign_assessment, assessment: assessment) }
  let(:new_condition_set) { create(:occupation_condition_set, dimension: dimension, name: 'New Set') }

  describe '#call' do
    context 'when occupations are not enabled for the dimension' do
      let(:dimension) { create(:dimension, occupations_enabled: false) }

      it 'broadcasts :ok without updating the condition set' do
        original_id = campaign_assessment.occupation_condition_set_id

        expect { described_class.call(campaign_assessment, new_condition_set.id, false) }.
          to broadcast(:ok)

        expect(campaign_assessment.reload.occupation_condition_set_id).to eq(original_id)
      end
    end

    context 'when apply_to_existing_users is false' do
      it 'updates the condition set on the campaign assessment only' do
        expect { described_class.call(campaign_assessment, new_condition_set.id, false) }.
          to broadcast(:ok)

        expect(campaign_assessment.reload.occupation_condition_set_id).to eq(new_condition_set.id)
      end

      it 'does not enqueue any rescore jobs' do
        expect do
          described_class.call(campaign_assessment, new_condition_set.id, false)
        end.not_to have_enqueued_job(UsersResults::RescoreOccupationsJob)
      end
    end

    context 'when apply_to_existing_users is true' do
      let!(:completed_result) do
        create(:users_result,
               assessment_id: assessment.id,
               campaign_id: campaign_assessment.campaign_id,
               status: :completed)
      end

      it 'updates the condition set on the campaign assessment and all completed results' do
        described_class.call(campaign_assessment, new_condition_set.id, true)

        expect(campaign_assessment.reload.occupation_condition_set_id).to eq(new_condition_set.id)
        expect(completed_result.reload.occupation_condition_set_id).to eq(new_condition_set.id)
      end

      it 'enqueues a rescore job for completed results' do
        expect do
          described_class.call(campaign_assessment, new_condition_set.id, true)
        end.to have_enqueued_job(UsersResults::RescoreOccupationsJob)
      end
    end
  end
end
