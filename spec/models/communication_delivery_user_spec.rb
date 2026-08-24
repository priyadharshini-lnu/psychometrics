# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommunicationDeliveryUser, type: :model do
  context 'Associations' do
    it { should belong_to(:communication_delivery) }
    it { should belong_to(:user) }
  end

  describe 'validations' do
    it 'is valid for a user who is a member of the delivery campaign' do
      delivery = create(:communication_delivery)
      user = create(:user)
      create(:campaign_user, campaign: delivery.campaign, user: user)

      delivery_user = build(:communication_delivery_user, communication_delivery: delivery, user: user)

      expect(delivery_user).to be_valid
    end

    it 'is invalid for a user who is not a member of the delivery campaign' do
      delivery = create(:communication_delivery)
      user = create(:user)

      delivery_user = build(:communication_delivery_user, communication_delivery: delivery, user: user)

      expect(delivery_user).not_to be_valid
      expect(delivery_user.errors[:user]).to be_present
    end

    it 'enforces uniqueness of user scoped to communication_delivery' do
      delivery = create(:communication_delivery)
      user = create(:user)
      create(:campaign_user, campaign: delivery.campaign, user: user)
      create(:communication_delivery_user, communication_delivery: delivery, user: user)

      duplicate = build(:communication_delivery_user, communication_delivery: delivery, user: user)

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:user_id]).to be_present
    end
  end

  describe 'tenant scoping' do
    it 'resolves tenant_id from the communication_delivery' do
      delivery = create(:communication_delivery)
      user = create(:user)
      create(:campaign_user, campaign: delivery.campaign, user: user)

      delivery_user = create(:communication_delivery_user, communication_delivery: delivery, user: user)

      expect(delivery_user.tenant_id).to eq(delivery.tenant_id)
    end
  end
end
