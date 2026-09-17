# frozen_string_literal: true

require 'rails_helper'

describe Threesixty::SubjectSerializer do
  let(:current_user) { create(:superadmin) }

  describe 'subject is also evaluator' do
    let(:user) { create(:user, email: 'dustin@poirier.com') }

    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:option) do
      create(:threesixty_option,
             reports: { 'access' => { 'self_can_access' => true },
                        'approval' => { 'manager_approves_reports' => true } })
    end
    let(:subject) do
      create(:threesixty_subject, user: user, campaign: campaign)
    end
    let!(:evaluator) do
      create(:threesixty_evaluator, user: user, campaign: campaign)
    end
    let(:counters) do
      {
        subject.user_id => { total_evaluators: 5, total_evaluations: 5,
                             completed_evaluations: 3, completed_evaluators: 4 }
      }
    end
    let(:subject_evaluator_counters) do
      {
        subject.user_id => {
          all: { 1 => 2, 2 => 2, 3 => 1 }, # total 5 evaluators
          completed: { 1 => 2, 2 => 1, 3 => 1 } # total 4 evaluators
        }
      }
    end
    before do
      allow(Threesixty::Reports::IsAvailable).to receive(:call!).and_return(true)
    end

    it do
      result = described_class.new(context: {
        option: option,
        counters: counters,
        subject_evaluator_counters: subject_evaluator_counters,
        current_user: current_user
      }).serialize(subject).deep_symbolize_keys

      expect(result[:evaluators]).to eq '4 / 5'
      expect(result[:report_status]).to eq Threesixty::Participants::GetReportStatus::INCOMPLETE
      expect(result[:evaluations]).to eq '3 / 5'
      expect(result[:user][:email]).to eq 'dustin@poirier.com'
    end
  end
  describe 'subject is not evaluator' do
    let(:user) { create(:user, email: 'dustin@poirier.com') }
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:option) do
      create(:threesixty_option,
             reports: { 'access' => { 'self_can_access' => true },
                        'approval' => { 'manager_approves_reports' => true } })
    end
    let(:subject) do
      create(:threesixty_subject, user: user, campaign: campaign, report_approval_status: 2)
    end

    let(:manager_relationship) { create(:relationship, name: 'manager') }
    let(:peer_relationship) { create(:relationship, name: 'peer') }
    let(:nomination_requirement) do
      create(:threesixty_nomination_requirement, conditions: [
        { 'relationship_id' => manager_relationship.id, 'value' => '4' },
        { 'relationship_id' => peer_relationship.id, 'value' => '5' }
      ])
    end
    let(:counters) do
      {
        subject.user_id => { total_evaluators: 5,
                             total_evaluations: 5, completed_evaluations: 3, completed_evaluators: 5 }
      }
    end

    it do
      result = described_class.new(context: {
        option: option, counters: counters, nomination_requirement: nomination_requirement, current_user: current_user
      }).serialize(subject).deep_symbolize_keys

      expect(result[:evaluators]).to eq '5 / 5'
      expect(result[:report_status]).to eq Threesixty::Participants::GetReportStatus::DENIED
      expect(result[:status]).to eq Threesixty::Participants::GetStatus::NOT_COMPLETED
      expect(result[:evaluations]).to eq '3 / 5'
      expect(result[:user][:email]).to eq 'dustin@poirier.com'
    end
  end

  describe 'available_report_languages' do
    let(:user) { create(:user) }
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:option) do
      create(:threesixty_option,
             reports: { 'access' => { 'self_can_access' => true },
                        'approval' => { 'manager_approves_reports' => false } })
    end
    let(:subject) { create(:threesixty_subject, user: user, campaign: campaign) }
    let(:user_report) { create(:user_report, user: user, campaign_id: campaign.id) }
    let(:counters) do
      {
        subject.user_id => { total_evaluators: 1, total_evaluations: 1,
                             completed_evaluations: 1, completed_evaluators: 1 }
      }
    end

    context 'when user has report PDFs in multiple languages' do
      before do
        create(:user_report_pdf, user_report: user_report, locale: 'en')
        create(:user_report_pdf, user_report: user_report, locale: 'ar')
      end

      it 'returns available languages' do
        result = described_class.new(context: {
          option: option,
          counters: counters,
          current_user: current_user,
          campaign_id: campaign.id,
          project_id: project.id
        }).serialize(subject).deep_symbolize_keys

        expect(result[:available_report_languages]).to contain_exactly('en', 'ar')
      end
    end

    context 'when user has no report PDFs' do
      it 'returns empty array' do
        result = described_class.new(context: {
          option: option,
          counters: counters,
          current_user: current_user,
          campaign_id: campaign.id,
          project_id: project.id
        }).serialize(subject).deep_symbolize_keys

        expect(result[:available_report_languages]).to eq([])
      end
    end
  end

  describe 'is_uat' do
    let(:project) { create(:project) }
    let(:campaign) { create(:campaign, project: project) }
    let(:option) { create(:threesixty_option) }
    let(:counters) do
      {
        subject.user_id => { total_evaluators: 1, total_evaluations: 1,
                             completed_evaluations: 1, completed_evaluators: 1 }
      }
    end

    def serialized_user
      described_class.new(context: {
        option: option,
        counters: counters,
        current_user: current_user,
        campaign_id: campaign.id,
        project_id: project.id
      }).serialize(subject).deep_symbolize_keys[:user]
    end

    context 'when the subject user is a UAT user' do
      let(:user) { create(:user, is_uat: true) }
      let(:subject) { create(:threesixty_subject, user: user, campaign: campaign) }

      it 'serializes is_uat as true' do
        expect(serialized_user[:is_uat]).to eq(true)
      end
    end

    context 'when the subject user is not a UAT user' do
      let(:user) { create(:user, is_uat: false) }
      let(:subject) { create(:threesixty_subject, user: user, campaign: campaign) }

      it 'serializes is_uat as false' do
        expect(serialized_user[:is_uat]).to eq(false)
      end
    end
  end
end
