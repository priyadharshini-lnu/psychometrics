# frozen_string_literal: true

require 'rails_helper'

describe Hogan::AddReports do
  let(:assessment) { create(:hogan_assessment) }
  let(:report) { create(:report, :hogan, assessments: [assessment]) }
  let(:report_family) { create(:report_family) }
  let!(:report_families_report) do
    create(:report_families_report,
           report: report,
           report_family: report_family,
           external_package_id: 'RPtFlashPkgLead')
  end
  let(:user) { create(:user) }
  let!(:hogan_credential) { create(:hogan_credential, user: user) }
  let(:user_report) { create(:user_report, user: user, report: report, report_family: report_family) }

  context 'when we have 2 reports with same package' do
    let(:extra_report) { create(:report, :hogan, assessments: [assessment]) }
    let!(:extra_report_families_report) do
      create(:report_families_report,
             report: extra_report,
             report_family: report_family,
             external_package_id: 'RPtFlashPkgLead')
    end
    let(:extra_user_report) { create(:user_report, report: extra_report, report_family: report_family) }

    it 'we call Hogan Api once' do
      expect(Services::Hogan::Api::Json::AddParticipantReport).to receive(:call).exactly(1).time
      Hogan::AddReports.call!(user_report)

      expect(user.hogan_credential).to be_truthy
    end
  end

  context 'when we have 1 report is our of the package' do
    let(:extra_report) do
      create(:report,
             assessments: [assessment],
             external_settings: { report_id: 'something_new' },
             provider: :hogan)
    end
    let(:extra_user_report) { create(:user_report, report: extra_report) }

    it 'we call Hogan Api two times' do
      expect(Services::Hogan::Api::Json::AddParticipantReport).to receive(:call).exactly(2).time
      Hogan::AddReports.call!([user_report, extra_user_report])

      expect(user.hogan_credential).to be_truthy
    end

    context 'external_added updates for report belonging to package' do
      before do
        report_families_report.update(external_package_id: nil)
      end

      it 'updates external_added to true if user_report got added to hogan' do
        stub_command_broadcast('Services::Hogan::Api::Json::AddParticipantReport', :ok, [])
        Hogan::AddReports.call!(user_report)

        expect(user_report.external_added).to eq(true)
      end

      it "doesn't external_added to true if user_report didn't got added to hogan" do
        stub_command_broadcast('Services::Hogan::Api::Json::AddParticipantReport', :error, [])
        Hogan::AddReports.call!(user_report)

        expect(user_report.external_added).to eq(false)
      end
    end

    context 'external_added updates for report not belonging to package' do
      it 'updates external_added to true if user_report got added to hogan' do
        stub_command_broadcast('Services::Hogan::Api::Json::AddParticipantReport', :ok, [])
        Hogan::AddReports.call!(user_report)

        expect(user_report.reload.external_added).to eq(true)
      end

      it "doesn't external_added to true if user_report didn't got added to hogan" do
        stub_command_broadcast('Services::Hogan::Api::Json::AddParticipantReport', :error, [])
        Hogan::AddReports.call!(user_report)

        expect(user_report.external_added).to eq(false)
      end
    end
  end
end
