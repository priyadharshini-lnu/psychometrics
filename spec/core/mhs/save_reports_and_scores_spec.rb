# frozen_string_literal: true

require 'rails_helper'

describe Mhs::SaveReportsAndScores do
  let!(:project) { create(:project) }
  let!(:campaign) { create(:campaign, project: project) }
  let(:assessment) { create(:assessment, :mhs, project: project) }
  let(:user_assessment) { create(:user_assessment, assessment: assessment, project: project, campaign: campaign) }
  let!(:mhs_user_assessment) do
    create(:mhs_user_assessment, user_assessment: user_assessment, observation_item_sets: ['test'])
  end
  let(:report) { create(:report, :mhs, assessments: [assessment]) }
  let!(:user_report1) do
    create(:user_report, user: user_assessment.subject, campaign: campaign, report: report, external_added: false)
  end
  let!(:user_report2) do
    create(:user_report, user: user_assessment.subject, campaign: campaign, report: report, external_added: true)
  end

  let(:users_result) do
    create(:users_result, user_assessment: user_assessment, external_results: {
      'evaluation_id' => 'test-eval-id',
      'outcome_item_sets' => ['test']
    })
  end

  subject { described_class.new(user_assessment, [user_report1, user_report2]) }

  before do
    allow(user_assessment).to receive(:users_result).and_return(users_result)
  end

  describe '#call' do
    context 'when user reports have mixed external_added status' do
      it 'only processes reports that are not external_added' do
        allow(Mhs::CreateEnrichmentResult).to receive(:call!).and_return({
          pdf: 'https://example.com/test-report.pdf'
        })

        allow(Mhs::GetEnrichmentResult).to receive(:call).and_return({
          ok: { content: 'test pdf content', filename: 'test.pdf' }
        })

        expect(Mhs::CreateEnrichmentResult).to receive(:call!).with(user_assessment, user_report1).once
        expect(Mhs::CreateEnrichmentResult).not_to receive(:call!).with(user_assessment, user_report2)

        subject.call

        expect(user_report1.reload.external_added).to be true
        expect(user_report2.reload.external_added).to be true # unchanged
      end
    end

    context 'when reports already have PDFs' do
      before do
        allow(user_report1).to receive(:pdf_exists?).and_return(true)
      end

      it 'skips reports that already have PDFs' do
        expect(Mhs::CreateEnrichmentResult).not_to receive(:call!)

        subject.call
      end
    end

    context 'when enrichment result is blank' do
      it 'schedules retry without setting external_added' do
        allow(Mhs::CreateEnrichmentResult).to receive(:call!).and_return(nil)
        expect(Mhs::SaveReportsAndScoresJob).to receive(:set).and_return(double(perform_later: true))

        subject.call

        expect(user_report1.reload.external_added).to be false
      end
    end

    context 'when enrichment result has no PDF URL' do
      it 'schedules retry without setting external_added' do
        allow(Mhs::CreateEnrichmentResult).to receive(:call!).and_return({ pdf: nil })
        expect(Mhs::SaveReportsAndScoresJob).to receive(:set).and_return(double(perform_later: true))

        subject.call

        expect(user_report1.reload.external_added).to be false
      end
    end

    context 'when PDF content is blank' do
      it 'skips the report without setting external_added' do
        allow(Mhs::CreateEnrichmentResult).to receive(:call!).and_return({
          pdf: 'https://example.com/test-report.pdf'
        })

        allow(Mhs::GetEnrichmentResult).to receive(:call).and_return({
          ok: { content: '', filename: 'test.pdf' }
        })

        subject.call

        expect(user_report1.reload.external_added).to be false
      end
    end

    context 'when processing is successful' do
      it 'attaches PDF and sets external_added to true' do
        allow(Mhs::CreateEnrichmentResult).to receive(:call!).and_return({
          pdf: 'https://example.com/test-report.pdf'
        })

        allow(Mhs::GetEnrichmentResult).to receive(:call).and_return({
          ok: { content: 'test pdf content', filename: 'test.pdf' }
        })

        expect(user_report1).to receive(:update!).with(status: :generating)
        expect(user_report1).to receive(:attach_pdf!)
        expect(user_report1).to receive(:update!).with(external_added: true)

        subject.call
      end
    end

    context 'when retry job runs after report was already processed' do
      let!(:user_report_for_retry) do
        create(:user_report, user: user_assessment.subject, campaign: campaign, report: report, external_added: false)
      end

      subject { described_class.new(user_assessment, [user_report_for_retry], retry_count: 1) }

      it 'skips processing if external_added was set by another job' do
        # Simulate another job completing the report before this retry runs
        user_report_for_retry.update!(external_added: true)

        expect(Mhs::CreateEnrichmentResult).not_to receive(:call!)

        subject.call
      end

      it 'skips processing if PDF was attached by another job' do
        # Simulate PDF being attached by another job
        allow_any_instance_of(UserReport).to receive(:pdf_exists?).and_return(true)

        expect(Mhs::CreateEnrichmentResult).not_to receive(:call!)

        subject.call
      end

      it 'reloads user_report to get fresh state from database' do
        allow(Mhs::CreateEnrichmentResult).to receive(:call!).and_return({
          pdf: 'https://example.com/test-report.pdf'
        })
        allow(Mhs::GetEnrichmentResult).to receive(:call).and_return({
          ok: { content: 'test pdf content', filename: 'test.pdf' }
        })
        allow(user_report_for_retry).to receive(:attach_pdf!)

        expect(user_report_for_retry).to receive(:reload).and_call_original

        subject.call
      end
    end
  end
end
