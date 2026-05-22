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
      expect(Mettl::SaveScoresAndReport).to_not receive(:call!)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end
  end

  describe 'simulation user_assessment' do
    let(:assessment) { create(:assessment, :simulation) }
    let(:report) { create(:report, :internal, assessments: [assessment], provider: 'internal') }
    let(:user_assessment) { create(:user_assessment, assessment: assessment) }
    let!(:simulation_user_assessment) do
      create(:simulation_user_assessment, user_assessment: user_assessment)
    end

    it 'call Simulation::SaveScoresAndReport' do
      allow(user_assessment).to receive(:completed?).and_return(true)
      expect(Simulation::SaveScoresAndReport).to receive(:call!).with(user_assessment)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end

    it "doesn't call Simulation::SaveScoresAndReport if assessment is not_started" do
      allow(user_assessment).to receive(:not_started?).and_return(true)
      expect(Simulation::SaveScoresAndReport).to_not receive(:call!)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end
  end

  describe 'pearson user_assessment' do
    let(:assessment) { create(:assessment, :pearson) }
    let(:report) { create(:report, :pearson, assessments: [assessment], provider: 'pearson') }
    let(:user_assessment) { create(:user_assessment, assessment: assessment) }
    let!(:pearson_user_assessment) do
      create(:pearson_user_assessment, user_assessment: user_assessment, norm_id: 'norm_id')
    end

    it 'call Pearson::SaveScoresAndReports' do
      allow(user_assessment).to receive(:completed?).and_return(true)
      expect(Pearson::SaveScoresAndReports).to receive(:call!).with(user_assessment)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end

    it "doesn't call Pearson::SaveScoresAndReports if assessment is not_started" do
      allow(user_assessment).to receive(:not_started?).and_return(true)
      expect(Pearson::SaveScoresAndReports).to_not receive(:call!)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end
  end

  describe 'agile user_assessment' do
    let(:assessment) { create(:assessment) }
    let(:user_assessment) { create(:user_assessment, assessment: assessment) }

    before do
      allow(user_assessment.users_result.assessment).to receive(:agile?).and_return(true)
    end

    it 'call UsersResults::CalculateAgileScoring' do
      allow(user_assessment).to receive(:completed?).and_return(true)
      expect(UsersResults::CalculateAgileScoring).to receive(:call!).with(user_assessment.users_result)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end

    it "doesn't call UsersResults::CalculateAgileScoring if assessment is not_started" do
      allow(user_assessment).to receive(:not_started?).and_return(true)
      expect(UsersResults::CalculateAgileScoring).to_not receive(:call!)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end
  end

  describe 'yoodli user_assessment' do
    let(:assessment) { create(:assessment, :yoodli) }
    let(:report) { create(:report, :yoodli, assessments: [assessment], provider: 'yoodli') }
    let(:user_assessment) { create(:user_assessment, assessment: assessment) }
    let!(:yoodli_user_assessment) do
      create(:yoodli_user_assessment, user_assessment: user_assessment, email: user_assessment.user.email)
    end

    it 'call Yoodli::ImportFromS3Service' do
      allow(user_assessment).to receive(:completed?).and_return(true)
      expect(Yoodli::ImportFromS3Service).to receive(:call).with(user_assessment_id: user_assessment.id)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end

    it "doesn't call Yoodli::ImportFromS3Service if assessment is not_started" do
      allow(user_assessment).to receive(:not_started?).and_return(true)
      expect(Yoodli::ImportFromS3Service).to_not receive(:call)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end
  end

  describe 'non agile user_assessment' do
    let(:assessment) { create(:assessment) }
    let(:user_assessment) { create(:user_assessment, assessment: assessment) }

    it 'call ::UsersResults::CalculateScoring' do
      allow(user_assessment).to receive(:completed?).and_return(true)
      expect(UsersResults::CalculateScoring).to receive(:call!).with(user_assessment.users_result)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end

    it "doesn't call ::UsersResults::CalculateScoring if assessment is not_started" do
      allow(user_assessment).to receive(:not_started?).and_return(true)
      expect(UsersResults::CalculateScoring).to_not receive(:call!)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end
  end

  describe 'microsite user_assessment' do
    let(:assessment) { create(:assessment, :microsite) }
    let(:user_assessment) { create(:user_assessment, assessment: assessment) }
    let!(:microsite_user_assessment) do
      create(:microsite_user_assessment, user_assessment: user_assessment)
    end

    let(:fetch_results) do
      {
        responses: { 'q1' => 'answer1' },
        completed_at: '2026-05-16T10:00:00Z'
      }
    end

    it 'calls Microsite::FetchResults on completed assessment' do
      allow(user_assessment).to receive(:completed?).and_return(true)

      expect(Microsite::FetchResults).to receive(:call).with(microsite_user_assessment)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end

    it "doesn't call Microsite::FetchResults if assessment is not_started" do
      allow(user_assessment).to receive(:not_started?).and_return(true)
      expect(Microsite::FetchResults).to_not receive(:call)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end

    it "doesn't call Microsite::FetchResults if no microsite_user_assessment exists" do
      allow(user_assessment).to receive(:completed?).and_return(true)
      microsite_user_assessment.destroy
      user_assessment.reload

      expect(Microsite::FetchResults).to_not receive(:call)

      described_class.call!(user_assessment.users_result, user_assessment.user)
    end
  end
end
