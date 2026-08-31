# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Communications::Emails::ContentSource do
  describe '.for' do
    it 'wraps the delivery for a delivery-created email' do
      delivery = create(:communication_delivery)
      email = create(:communication_email, communication: nil, communication_delivery: delivery)

      expect(described_class.for(email).record).to eq(delivery)
    end

    it 'wraps the communication for a legacy email' do
      email = create(:communication_email)

      expect(described_class.for(email).record).to eq(email.communication)
    end
  end

  describe '#cc_emails' do
    it 'returns the emails of the delivery cc_users' do
      delivery = create(:communication_delivery)
      cc_user = create(:user, email: 'cc-recipient@example.com')
      create(:communication_delivery_cc_user, communication_delivery: delivery, user: cc_user)

      expect(described_class.new(delivery).cc_emails).to contain_exactly('cc-recipient@example.com')
    end

    it 'returns an empty array when there are no cc_users' do
      delivery = create(:communication_delivery)

      expect(described_class.new(delivery).cc_emails).to eq([])
    end
  end
end
