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

  describe '#update_project_feature' do
    let(:project) { create(:project) }
    let(:client_feature) { project.parent.client_feature }

    before do
      client_feature.update!(glint_ui: true)
      project.project_feature.update!(glint_ui: true)
    end

    it 'disables glint_ui on the child projects when the client flag is switched off' do
      client_feature.update!(glint_ui: false)

      expect(project.project_feature.reload.glint_ui).to be(false)
    end

    it 'leaves the project flag alone while the client flag stays on' do
      client_feature.update!(sms_notification: true)

      expect(project.project_feature.reload.glint_ui).to be(true)
    end
  end
end
