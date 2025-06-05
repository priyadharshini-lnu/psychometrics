# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Skillvue::ResetAssessment do
  let(:assessment) { create(:assessment, :skillvue) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let!(:skillvue_user_assessment) do
    create(:skillvue_user_assessment,
           user_assessment: user_assessment,
           url: 'http://old-url.com',
           email: 'old-email@example.com')
  end

  let(:service) { described_class.new(user_assessment) }

  describe '#call' do
    before do
      allow(Skillvue::InviteCandidate).to receive(:call!)
      allow(service).to receive(:broadcast)
    end

    it 'resets skillvue user assessment attributes' do
      service.call

      expect(skillvue_user_assessment.reload.url).to be_nil
      expect(skillvue_user_assessment.reload.email).to be_nil
    end

    it 'calls InviteCandidate service' do
      expect(Skillvue::InviteCandidate).to receive(:call!).with(user_assessment)

      service.call
    end

    it 'broadcasts :ok' do
      expect(service).to receive(:broadcast).with(:ok)

      service.call
    end
  end
end
