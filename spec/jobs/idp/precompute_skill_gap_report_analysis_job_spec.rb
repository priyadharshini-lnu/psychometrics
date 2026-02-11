# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Idp::PrecomputeSkillGapReportAnalysisJob, type: :job do
  describe '#perform' do
    let(:user) { create(:user) }
    let(:campaign) { create(:campaign) }
    let(:report) { create(:report) }
    let(:user_report) { create(:user_report, user: user, campaign: campaign, report: report, status: :prepared) }
    let(:ai_assistant) { create(:assistant) }
    let(:idp_template) do
      create(:idp_template,
             project: campaign.project,
             report: report,
             skill_gap_report_analysis_ai_assistant: ai_assistant)
    end
    let(:user_idp_plan) do
      create(:user_idp_plan,
             user: user,
             campaign: campaign,
             idp_template: idp_template,
             active: true)
    end

    let(:skill_gap_analysis_tool) { instance_double(AI::Tools::Idp::SkillGapReportAnalysis) }

    before do
      user_idp_plan
      allow(Settings.features).to receive(:ai_assistant_enabled).and_return(true)
      allow_any_instance_of(ProjectFeature).to receive(:ai_assisted_idp?).and_return(true)
      idp_template.update!(one_click_idp_enabled: true)
    end

    context 'when user report is prepared and active IDP plan exists' do
      it 'calls SkillGapReportAnalysis tool with correct parameters' do
        expect(AI::Tools::Idp::SkillGapReportAnalysis).to receive(:new).with(
          user_idp_plan,
          user,
          ai_assistant
        ).and_return(skill_gap_analysis_tool)

        expect(skill_gap_analysis_tool).to receive(:execute)

        described_class.perform_now(user_report.id)
      end
    end

    context 'when user report does not exist' do
      it 'does not call SkillGapReportAnalysis tool' do
        expect(AI::Tools::Idp::SkillGapReportAnalysis).not_to receive(:new)

        described_class.perform_now(999_999)
      end
    end

    context 'when user report is not prepared' do
      it 'does not call SkillGapReportAnalysis tool' do
        user_report.update!(status: :not_prepared)

        expect(AI::Tools::Idp::SkillGapReportAnalysis).not_to receive(:new)

        described_class.perform_now(user_report.id)
      end
    end

    context 'when no active IDP plan exists' do
      it 'does not call SkillGapReportAnalysis tool' do
        user_idp_plan.update!(active: false)

        expect(AI::Tools::Idp::SkillGapReportAnalysis).not_to receive(:new)

        described_class.perform_now(user_report.id)
      end
    end

    context 'when IDP template has no AI assistant configured' do
      it 'does not call SkillGapReportAnalysis tool' do
        idp_template.update!(skill_gap_report_analysis_ai_assistant: nil)

        expect(AI::Tools::Idp::SkillGapReportAnalysis).not_to receive(:new)

        described_class.perform_now(user_report.id)
      end
    end

    context 'when AI assistant feature is disabled globally' do
      it 'does not call SkillGapReportAnalysis tool' do
        allow(Settings.features).to receive(:ai_assistant_enabled).and_return(false)

        expect(AI::Tools::Idp::SkillGapReportAnalysis).not_to receive(:new)

        described_class.perform_now(user_report.id)
      end
    end

    context 'when project does not have AI assisted IDP enabled' do
      it 'does not call SkillGapReportAnalysis tool' do
        allow_any_instance_of(ProjectFeature).to receive(:ai_assisted_idp?).and_return(false)

        expect(AI::Tools::Idp::SkillGapReportAnalysis).not_to receive(:new)

        described_class.perform_now(user_report.id)
      end
    end

    context 'when one-click IDP is not enabled on the template' do
      it 'does not call SkillGapReportAnalysis tool' do
        idp_template.update!(one_click_idp_enabled: false)

        expect(AI::Tools::Idp::SkillGapReportAnalysis).not_to receive(:new)

        described_class.perform_now(user_report.id)
      end
    end
  end
end
