# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ClientFeature, type: :model do
  describe 'associations' do
    it { should belong_to(:client) }
  end

  describe 'validations' do
    it { should allow_value(true).for(:sms_notification) }
    it { should allow_value(false).for(:sms_notification) }
  end

  describe 'factory' do
    let(:project_manager) { create(:superadmin) }
    let(:client) do
      create(:client,
             number: '123',
             country: 'UAE',
             year: '2024',
             project_manager: project_manager)
    end

    it 'is valid with valid attributes' do
      feature = described_class.new(client:, sms_notification: true)
      expect(feature).to be_valid
    end
  end
end
