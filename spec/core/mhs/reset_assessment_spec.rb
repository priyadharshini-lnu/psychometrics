# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Mhs::ResetAssessment do
  subject { described_class.new(user_assessment) }

  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let(:assessment) { create(:assessment, :mhs) }

  describe '#call' do
    let!(:existing_assessment) do
      create(:mhs_user_assessment,
             user_assessment: user_assessment,
             active: true)
    end

    it 'archives the existing assessment and creates a new one' do
      expect { subject.call }.to change(MhsUserAssessment, :count).by(1)
      # Check old assessment is archived
      existing_assessment.reload
      expect(existing_assessment.active).to be_falsey

      # Check new assessment is active
      user_assessment.reload
      new_assessment = user_assessment.mhs_user_assessment
      expect(new_assessment).to be_present
      expect(new_assessment.id).not_to eq(existing_assessment.id)
      expect(new_assessment.active).to be_truthy
    end

    it 'maintains history in previous_mhs_user_assessments' do
      subject.call

      previous_assessments = user_assessment.previous_mhs_user_assessments
      expect(previous_assessments.count).to eq(1)
      expect(previous_assessments.first).to eq(existing_assessment)
      expect(previous_assessments.first.active).to be_falsey
    end

    it 'broadcasts :ok' do
      expect(subject.call).to broadcast(:ok)
    end
  end
end
