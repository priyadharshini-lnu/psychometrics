# frozen_string_literal: true

require 'rails_helper'

describe UserReports::AssessmentNotCompletedReasonBuilder do
  subject(:result) { described_class.new(user_report).build }

  let(:user_report) { instance_double(UserReport) }
  let(:report) { instance_double(Report, assessment_ids: assessment_ids) }
  let(:assessment_ids) { [1, 2, 3] }

  before do
    allow(user_report).to receive_messages(
      campaign_id: 100,
      user_id: 200,
      report: report
    )

    allow_any_instance_of(described_class).to receive(:incomplete_non_assessor_assessment_names).and_return([])
    allow_any_instance_of(described_class).to receive(:incomplete_assessor_form_user_names).and_return([])
    allow_any_instance_of(described_class).to receive(:incomplete_lead_assessor_form_user_names).and_return([])
  end

  describe '#build' do
    context 'when all assessments are scored' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(true)
      end

      it 'returns nil' do
        expect(result).to be_nil
      end
    end

    context 'when no incomplete items are found' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
      end

      it 'returns nil' do
        expect(result).to be_nil
      end
    end

    context 'with single incomplete assessment' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        allow_any_instance_of(described_class).
          to receive(:incomplete_non_assessor_assessment_names).
          and_return(['Assessment A'])
      end

      it 'returns assessment_not_completed reason with singular assessment message' do
        expect(result).to include(
          available: false,
          reason_code: 'assessment_not_completed',
          reason_message: I18n.t('shared.user_reports_assessment_name_not_completed_reason_template',
                                 names: 'Assessment A')
        )
      end
    end

    context 'with multiple incomplete assessments' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        allow_any_instance_of(described_class).
          to receive(:incomplete_non_assessor_assessment_names).
          and_return(['Assessment A', 'Assessment B'])
      end

      it 'returns assessment_not_completed reason with plural assessment message' do
        expect(result).to include(
          available: false,
          reason_code: 'assessment_not_completed',
          reason_message: I18n.t('shared.user_reports_assessments_name_not_completed_reason_template',
                                 names: 'Assessment A, Assessment B')
        )
      end
    end

    context 'with single incomplete assessor form user' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        allow_any_instance_of(described_class).
          to receive(:incomplete_assessor_form_user_names).
          and_return(['John Doe'])
      end

      it 'returns assessment_not_completed reason with singular assessor form message' do
        expect(result).to include(
          available: false,
          reason_code: 'assessment_not_completed',
          reason_message: I18n.t('shared.user_reports_assessor_not_completed_reason_template', names: 'John Doe')
        )
      end
    end

    context 'with multiple incomplete assessor form users' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        allow_any_instance_of(described_class).
          to receive(:incomplete_assessor_form_user_names).
          and_return(['John Doe', 'Jane Smith'])
      end

      it 'returns assessment_not_completed reason with plural assessor form message' do
        expect(result).to include(
          available: false,
          reason_code: 'assessment_not_completed',
          reason_message: I18n.t('shared.user_reports_assessors_not_completed_reason_template',
                                 names: 'John Doe, Jane Smith')
        )
      end
    end

    context 'with single incomplete lead assessor form user' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        allow_any_instance_of(described_class).
          to receive(:incomplete_lead_assessor_form_user_names).
          and_return(['Lead Assessor'])
      end

      it 'returns assessment_not_completed reason with singular lead assessor form message' do
        expect(result).to include(
          available: false,
          reason_code: 'assessment_not_completed',
          reason_message: I18n.t('shared.user_reports_lead_assessor_not_completed_reason_template',
                                 names: 'Lead Assessor')
        )
      end
    end

    context 'with multiple incomplete lead assessor form users' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        allow_any_instance_of(described_class).
          to receive(:incomplete_lead_assessor_form_user_names).
          and_return(['Lead A', 'Lead B'])
      end

      it 'returns assessment_not_completed reason with plural lead assessor form message' do
        expect(result).to include(
          available: false,
          reason_code: 'assessment_not_completed',
          reason_message: I18n.t('shared.user_reports_lead_assessors_not_completed_reason_template',
                                 names: 'Lead A, Lead B')
        )
      end
    end

    context 'with multiple message types (assessment + assessor + lead assessor)' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        allow_any_instance_of(described_class).
          to receive(:incomplete_non_assessor_assessment_names).
          and_return(['Assessment A', 'Assessment B'])
        allow_any_instance_of(described_class).
          to receive(:incomplete_assessor_form_user_names).
          and_return(['John Doe'])
        allow_any_instance_of(described_class).
          to receive(:incomplete_lead_assessor_form_user_names).
          and_return(['Lead Assessor'])
      end

      it 'returns bullet list format with all messages' do
        expect(result[:reason_message]).to include("- #{I18n.t(
          'shared.user_reports_assessments_name_not_completed_reason_template', names: 'Assessment A, Assessment B'
        )}")
        expect(result[:reason_message]).to include("- #{I18n.t(
          'shared.user_reports_assessor_not_completed_reason_template', names: 'John Doe'
        )}")
        expect(result[:reason_message]).to include("- #{I18n.t(
          'shared.user_reports_lead_assessor_not_completed_reason_template', names: 'Lead Assessor'
        )}")
        expect(result[:reason_message]).to match(/^- /) # Starts with bullet
      end

      it 'joins messages with newlines' do
        messages = result[:reason_message].split("\n")
        expect(messages.length).to eq(3)
      end
    end

    context 'with single assessment and single assessor' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        allow_any_instance_of(described_class).
          to receive(:incomplete_non_assessor_assessment_names).
          and_return(['Assessment A'])
        allow_any_instance_of(described_class).
          to receive(:incomplete_assessor_form_user_names).
          and_return(['John Doe'])
      end

      it 'returns bullet list format' do
        expect(result[:reason_message]).to include("- #{I18n.t(
          'shared.user_reports_assessment_name_not_completed_reason_template', names: 'Assessment A'
        )}")
        expect(result[:reason_message]).to include("- #{I18n.t(
          'shared.user_reports_assessor_not_completed_reason_template', names: 'John Doe'
        )}")
      end
    end

    context 'with only assessor and lead assessor (no assessment)' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        allow_any_instance_of(described_class).
          to receive(:incomplete_assessor_form_user_names).
          and_return(['John Doe'])
        allow_any_instance_of(described_class).
          to receive(:incomplete_lead_assessor_form_user_names).
          and_return(['Lead A', 'Lead B'])
      end

      it 'returns bullet list with both types' do
        expect(result[:reason_message]).to include("- #{I18n.t(
          'shared.user_reports_assessor_not_completed_reason_template', names: 'John Doe'
        )}")
        expect(result[:reason_message]).to include("- #{I18n.t(
          'shared.user_reports_lead_assessors_not_completed_reason_template', names: 'Lead A, Lead B'
        )}")
      end
    end

    context 'with only one message' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        allow_any_instance_of(described_class).
          to receive(:incomplete_non_assessor_assessment_names).
          and_return(['Assessment A'])
      end

      it 'returns the message without bullet point' do
        expect(result[:reason_message]).to eq(I18n.t(
                                                'shared.user_reports_assessment_name_not_completed_reason_template',
                                                names: 'Assessment A'
                                              ))
        expect(result[:reason_message]).not_to match(/^- /)
      end
    end

    context 'with empty user names (email fallback)' do
      before do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        allow_any_instance_of(described_class).
          to receive(:incomplete_assessor_form_user_names).
          and_return(['user@example.com'])
      end

      it 'displays the email' do
        expect(result[:reason_message]).to include('user@example.com')
      end
    end
  end
end
