# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Skillvue::SubscribeToWebhookJob, type: :job do
  describe '#perform' do
    it 'calls SubscribeToWebhook service with the project' do
      project = create(:project)

      expect(Skillvue::SubscribeToWebhook).to receive(:call!).with(an_instance_of(Project))

      described_class.perform_now(project.id)
    end

    it 'does nothing when project is not found' do
      expect(Skillvue::SubscribeToWebhook).not_to receive(:call!)

      described_class.perform_now(999)
    end
  end
end
