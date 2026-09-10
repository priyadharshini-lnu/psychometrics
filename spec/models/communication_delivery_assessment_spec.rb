# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommunicationDeliveryAssessment, type: :model do
  context 'Associations' do
    it { should belong_to(:communication_delivery) }
    it { should belong_to(:assessment) }
  end

  describe 'validations' do
    it 'is valid for an assessment that belongs to the delivery campaign' do
      delivery = create(:communication_delivery)
      assessment = create(:assessment)
      create(:campaign_assessment, campaign: delivery.campaign, assessment: assessment)

      delivery_assessment = build(:communication_delivery_assessment, communication_delivery: delivery,
                                                                        assessment: assessment)

      expect(delivery_assessment).to be_valid
    end

    it 'is invalid for an assessment that is not part of the delivery campaign' do
      delivery = create(:communication_delivery)
      assessment = create(:assessment)

      delivery_assessment = build(:communication_delivery_assessment, communication_delivery: delivery,
                                                                        assessment: assessment)

      expect(delivery_assessment).not_to be_valid
      expect(delivery_assessment.errors[:assessment]).to be_present
    end

    it 'enforces uniqueness of assessment scoped to communication_delivery' do
      delivery = create(:communication_delivery)
      assessment = create(:assessment)
      create(:campaign_assessment, campaign: delivery.campaign, assessment: assessment)
      create(:communication_delivery_assessment, communication_delivery: delivery, assessment: assessment)

      duplicate = build(:communication_delivery_assessment, communication_delivery: delivery, assessment: assessment)

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:assessment_id]).to be_present
    end
  end

  describe 'tenant scoping' do
    it 'resolves tenant_id from the communication_delivery' do
      delivery = create(:communication_delivery)
      assessment = create(:assessment)
      create(:campaign_assessment, campaign: delivery.campaign, assessment: assessment)

      delivery_assessment = create(:communication_delivery_assessment, communication_delivery: delivery,
                                                                         assessment: assessment)

      expect(delivery_assessment.tenant_id).to eq(delivery.tenant_id)
    end
  end
end
