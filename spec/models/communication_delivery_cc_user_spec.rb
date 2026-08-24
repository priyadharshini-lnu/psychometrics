# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommunicationDeliveryCcUser, type: :model do
  context 'Associations' do
    it { should belong_to(:communication_delivery) }
    it { should belong_to(:user) }
  end

  describe 'validations' do
    it 'enforces uniqueness of user scoped to communication_delivery' do
      delivery = create(:communication_delivery)
      user = create(:user)
      create(:communication_delivery_cc_user, communication_delivery: delivery, user: user)

      duplicate = build(:communication_delivery_cc_user, communication_delivery: delivery, user: user)

      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:user_id]).to be_present
    end
  end

  describe 'tenant scoping' do
    it 'resolves tenant_id from the communication_delivery' do
      delivery = create(:communication_delivery)
      user = create(:user)

      cc_user = create(:communication_delivery_cc_user, communication_delivery: delivery, user: user)

      expect(cc_user.tenant_id).to eq(delivery.tenant_id)
    end
  end
end
