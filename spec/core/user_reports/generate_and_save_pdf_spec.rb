# frozen_string_literal: true

require 'rails_helper'

describe UserReports::GenerateAndSavePdf do
  include Rails.application.routes.url_helpers

  let(:user) { create(:user, email: 'samdad@cc.com') }
  let(:user_assessment) { create(:user_assessment, campaign: create(:campaign)) }
  let(:user_result) do
    create(:users_result,
           { user_assessment: user_assessment,
             assessment: assessment,
             status: :completed,
             subject: user,
             evaluator: user })
  end

  let(:user_report) { create(:user_report, user: user, report: report) }
  let(:assessment) { create(:assessment) }
  let(:report) { create(:report, assessments: [assessment]) }
  let(:current_user) { create(:superadmin) }

  it 'save pdf in user_report if report can be generated' do
    allow(UserReports::GeneratePdf).to receive(:call!).and_return(file_path: 'spec/fixtures/files/reports/test.pdf')
    allow(user_report).to receive(:generatable?).and_return(true)
    allow(user_report).to receive(:user_results).and_return([user_result])

    described_class.call!(user_report, current_user)

    expect(user_report.user_report_pdf.pdf_file.filename).to eq('test.pdf')
    expect(user_report.user_report_pdf.pdf_file.content_type).to eq('application/pdf')
    expect(user_report.user_report_pdf.pdf_file.attached?).to be_truthy
    expect(rails_blob_path(user_report.user_report_pdf.pdf_file, only_path: true)).to be_present
  end

  context 'Saville Report' do
    it 'calls Saville::AssessmentOrderRequest if report is a saville report' do
      report = create(:report, :saville)
      users_result = create(:users_result)
      user_report = create(:user_report, report: report)
      expect(user_report).to receive(:generatable?).and_return(true)
      expect(user_report).to receive(:user_results).and_return(UsersResult.where(id: users_result.id))
      expect(Saville::AssessmentOrderRequest).to receive(:call!).with(users_result.user_assessment)

      described_class.call!(user_report, current_user)
    end
  end

  context 'Skillvue Report' do
    it 'calls Skillvue::SaveScoresAndReport if report is a skillvue report' do
      report = create(:report, :skillvue)
      users_result = create(:users_result)
      user_report = create(:user_report, report: report)
      expect(user_report).to receive(:generatable?).and_return(true)
      expect(user_report).to receive(:user_results).and_return(UsersResult.where(id: users_result.id))
      expect(Skillvue::SaveScoresAndReport).to receive(:call!).with(users_result.user_assessment)

      described_class.call!(user_report, current_user)
    end
  end

  context 'when force regenerate is true' do
    let!(:user_report_pdf) { create(:user_report_pdf, :with_pdf, user_report: user_report, locale: 'en') }

    before do
      allow(UserReports::GeneratePdf).to receive(:call!).and_return(file_path: 'spec/fixtures/files/reports/test.pdf')
      allow(user_report).to receive(:generatable?).and_return(true)
    end

    it 'regenerates report' do
      expect(UserReports::GeneratePdf).to receive(:call!).with(
        user_report,
        current_user,
        hash_including(lang: 'en')
      )

      described_class.call!(user_report, current_user, locales: ['en'], force_regenerate: true)
      expect(user_report.user_report_pdf.pdf_file.attached?).to be_truthy
      expect(user_report.user_report_pdf.last_generated_at).to be_present
    end
  end

  context 'when force regenerate is false' do
    let!(:user_report_pdf) { create(:user_report_pdf, :with_pdf, user_report: user_report, locale: 'en') }

    before do
      allow(UserReports::GeneratePdf).to receive(:call!).and_return(file_path: 'spec/fixtures/files/reports/test.pdf')
      allow(user_report).to receive(:generatable?).and_return(true)
    end

    it 'does not regenerate report if already attached' do
      expect(UserReports::GeneratePdf).to_not receive(:call!).with(
        user_report,
        current_user,
        hash_including(lang: 'en')
      )

      described_class.call!(user_report, current_user, locales: ['en'], force_regenerate: false)
      expect(user_report.user_report_pdf.pdf_file.attached?).to be_truthy
      expect(user_report.user_report_pdf.last_generated_at).to be_nil
    end

    it 'generates pdf if not attached' do
      user_report_pdf.update!(pdf_file: nil)

      expect(UserReports::GeneratePdf).to receive(:call!).with(
        user_report,
        current_user,
        hash_including(lang: 'en')
      )

      described_class.call!(user_report, current_user, locales: ['en'], force_regenerate: false)
      expect(user_report.user_report_pdf.pdf_file.attached?).to be_truthy
      expect(user_report.user_report_pdf.last_generated_at).to be_present
    end
  end

  context(
    'when user_report_selected_reports with report_id and locales ' \
    'mapping is provided for normal campaign bulk regenerate'
  ) do
    let(:user_report1) { create(:user_report, user: user) }
    let(:selected_reports) do
      {
        user_report.report_id.to_s => ['ar'],
        user_report1.report_id.to_s => ['en']
      }
    end

    before do
      allow(UserReports::GeneratePdf).to receive(:call!).and_return(file_path: 'spec/fixtures/files/reports/test.pdf')
      allow(user_report).to receive(:generatable?).and_return(true)
      allow(user_report1).to receive(:generatable?).and_return(true)
    end

    it 'generates report for specified languages' do
      expect(UserReports::GeneratePdf).to receive(:call!).with(
        user_report,
        current_user,
        hash_including(lang: 'ar')
      )

      expect(UserReports::GeneratePdf).to receive(:call!).with(
        user_report1,
        current_user,
        hash_including(lang: 'en')
      )

      described_class.call!(
        [user_report, user_report1],
        current_user,
        selected_reports: selected_reports,
        force_regenerate: true
      )
      expect(user_report.user_report_pdf(locale: 'ar').pdf_file.attached?).to be_truthy
      expect(user_report1.user_report_pdf(locale: 'en').pdf_file.attached?).to be_truthy
    end
  end
end
