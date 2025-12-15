# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Yoodli::ResetAssessment do
  subject { described_class.new(user_assessment) }

  let(:user_assessment) { create(:user_assessment, assessment: assessment) }
  let(:assessment) { create(:assessment, :yoodli) }

  describe '#call' do
    let!(:existing_assessment) do
      create(:yoodli_user_assessment,
             user_assessment: user_assessment,
             email: 'old@example.com',
             yoodli_activity_id: 'old_activity_123',
             active: true)
    end

    it 'archives the existing assessment and creates a new one' do
      expect { subject.call }.to change(YoodliUserAssessment, :count).by(1)

      # Check old assessment is archived
      existing_assessment.reload
      expect(existing_assessment.active).to be_falsey
      expect(existing_assessment.email).to eq('old@example.com')
      expect(existing_assessment.yoodli_activity_id).to eq('old_activity_123')

      # Check new assessment is active
      user_assessment.reload
      new_assessment = user_assessment.yoodli_user_assessment
      expect(new_assessment).to be_present
      expect(new_assessment.id).not_to eq(existing_assessment.id)
      expect(new_assessment.active).to be_truthy
      expect(new_assessment.email).to be_nil
      expect(new_assessment.yoodli_activity_id).to be_nil
    end

    it 'does not create a new assessment if the email is blank' do
      existing_assessment.update!(email: nil, yoodli_activity_id: nil)

      expect { subject.call }.not_to change(YoodliUserAssessment, :count)

      existing_assessment.reload
      expect(existing_assessment.active).to be_truthy
      expect(existing_assessment.email).to be_nil
      expect(existing_assessment.yoodli_activity_id).to be_nil
    end

    it 'maintains history in previous_yoodli_user_assessments' do
      subject.call

      previous_assessments = user_assessment.previous_yoodli_user_assessments
      expect(previous_assessments.count).to eq(1)
      expect(previous_assessments.first).to eq(existing_assessment)
      expect(previous_assessments.first.active).to be_falsey
    end

    it 'broadcasts :ok' do
      expect(subject.call).to broadcast(:ok)
    end
  end
end
