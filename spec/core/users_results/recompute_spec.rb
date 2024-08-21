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
      allow(user_assessment).to receive(:completed?).and_return(true)
      expect(Saville::AssessmentOrderRequest).to receive(:call!).with(user_assessment)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end

    it "doesn't call Saville::AssessmentOrderRequest if assessment is not_started" do
      allow(user_assessment).to receive(:not_started?).and_return(true)
      expect(Saville::AssessmentOrderRequest).to_not receive(:call!)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end
  end

  describe 'mettl user_assessment' do
    let(:assessment) { create(:assessment, :mettl) }
    let(:report) { create(:report, :mettl, assessments: [assessment], provider: 'mettl') }
    let(:user_assessment) { create(:user_assessment, assessment: assessment) }
    let!(:mettl_user_assessment) do
      create(:mettl_user_assessment, user_assessment: user_assessment)
    end

    it 'call Mettl::SaveScoresAndReport' do
      allow(user_assessment).to receive(:completed?).and_return(true)
      expect(Mettl::SaveScoresAndReport).to receive(:call!).with(user_assessment)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end

    it "doesn't call Mettl::SaveScoresAndReport if assessment is not_started" do
      allow(user_assessment).to receive(:not_started?).and_return(true)
      expect(Saville::AssessmentOrderRequest).to_not receive(:call!)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end
  end
end
