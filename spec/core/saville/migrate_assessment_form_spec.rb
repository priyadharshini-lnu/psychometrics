# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Saville::MigrateAssessmentForm do
  let(:email) { 'user@example.com' }
  let(:to_campaign) { 'campaign_2' }
  let(:from_campaign) { 'campaign_1' }
  let(:assessment_id) { 'assessment_123' }

  subject(:form) do
    described_class.new(
      email: email,
      to_campaign: to_campaign,
      from_campaign: from_campaign,
      assessment_id: assessment_id
    )
  end

  describe 'validations' do
    context 'when all conditions are met' do
      before do
        allow(form).to receive(:user_exists_for_from_campaign?).and_return(true)
        allow(form).to receive(:user_exists_for_to_campaign?).and_return(true)
        allow(form).to receive(:has_assessment_assigned_to_campaign?).and_return(true)
        allow(form).to receive(:has_assessment_assigned_from_campaign?).and_return(true)
      end

      it 'is valid' do
        expect(form).to be_valid
      end
    end

    context 'when user is not in from campaign' do
      before do
        allow(form).to receive(:user_exists_for_from_campaign?).and_return(false)
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include("User not in 'from' campaign")
      end
    end

    context 'when user is not in to campaign' do
      before do
        allow(form).to receive(:user_exists_for_to_campaign?).and_return(false)
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include("User not in 'to' campaign")
      end
    end

    context 'when there is no assessment in to campaign' do
      before do
        allow(form).to receive(:has_assessment_assigned_to_campaign?).and_return(false)
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include("No assessment in 'to' campaign")
      end
    end

    context 'when there is no assessment in from campaign' do
      before do
        allow(form).to receive(:has_assessment_assigned_from_campaign?).and_return(false)
      end

      it 'is invalid' do
        expect(form).not_to be_valid
        expect(form.errors[:base]).to include("No assessment in 'from' campaign")
      end
    end
  end
end
