# frozen_string_literal: true

require 'rails_helper'

describe CampaignAssessments::UpdatePositions, type: :command do
  let(:campaign) { create(:campaign) }
  let(:campaign_assessment_group) { create(:campaign_assessment_group, campaign: campaign) }
  let(:campaign_assessments) do
    [
      {
        'id' => create(:campaign_assessment, campaign: campaign).id,
        'campaign_assessment_group_id' => campaign_assessment_group.id,
        'position' => 2,
        'workshop_activity_duration' => 30
      }
    ]
  end

  subject { described_class.new(campaign, campaign_assessments) }

  describe '#call' do
    context 'when all inputs are valid' do
      it 'updates the positions and broadcasts :ok' do
        expect { subject.call }.to broadcast(:ok)

        campaign_assessments.each do |ca|
          updated_assessment = campaign.campaign_assessments.find(ca['id'])
          expect(updated_assessment.campaign_assessment_group_id).to eq(ca['campaign_assessment_group_id'])
          expect(updated_assessment.position).to eq(ca['position'])
          expect(updated_assessment.workshop_activity_duration).to eq(ca['workshop_activity_duration'])
        end
      end
    end

    context 'when duration form is invalid' do
      before do
        allow_any_instance_of(Campaigns::WorkshopActivityDurationForm).to receive(:valid?).and_return(false)
        allow_any_instance_of(Campaigns::WorkshopActivityDurationForm).
          to receive_message_chain(:errors, :full_messages).and_return(['Invalid duration'])
      end

      it 'broadcasts :error and does not update positions' do
        expect { subject.call }.to broadcast(:error, [{ base: 'Invalid duration' }])

        campaign_assessments.each do |ca|
          updated_assessment = campaign.campaign_assessments.find(ca['id'])
          expect(updated_assessment.campaign_assessment_group_id).not_to eq(ca['campaign_assessment_group_id'])
          expect(updated_assessment.position).not_to eq(ca['position'])
        end
      end
    end
  end
end
