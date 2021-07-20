# frozen_string_literal: true

require 'rails_helper'

describe UsersResults::Recompute do
  describe 'saville user_assessment' do
    let(:assessment) { create(:assessment, :saville) }
    let(:report) { create(:report, :saville, assessments: [assessment], provider: 'saville') }
    let(:user_assessment) { create(:user_assessment, assessment: assessment) }
    let!(:saville_user_assessment) do
      create(:saville_user_assessment, user_assessment: user_assessment, norm_id: 'norm_id')
    end

    it 'call Saville::AssessmentOrderRequest' do
      allow(user_assessment).to receive(:not_started?).and_return(false)
      expect(Saville::AssessmentOrderRequest).to receive(:call!).with(user_assessment)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end

    it "doesn't call Saville::AssessmentOrderRequest if assessment is not_started" do
      allow(user_assessment).to receive(:not_started?).and_return(true)
      expect(Saville::AssessmentOrderRequest).to_not receive(:call!)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end

    it 'saves passed norm and fixed_norm ' do
      norm_id = 'some_norm'
      described_class.call!(user_assessment.users_result, user_assessment.user, { norm_id: norm_id, fixed_norm: true })

      expect(saville_user_assessment.norm_id).to eq(norm_id)
      expect(user_assessment.fixed_norm).to eq(true)
    end
  end

  describe 'internal user_assessment' do
    let(:user_assessment) { create(:user_assessment) }
    let(:norm) { create(:norm) }

    it 'saves passed norm and fixed_norm ' do
      described_class.call!(user_assessment.users_result, user_assessment.user, { norm_id: norm.id, fixed_norm: true })

      expect(user_assessment.norm_id).to eq(norm.id)
      expect(user_assessment.fixed_norm).to eq(true)
    end
  end
end
