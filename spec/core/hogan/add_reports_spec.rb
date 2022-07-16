# frozen_string_literal: true

require 'rails_helper'

describe Hogan::AddReports do
  let(:assessment) do
    create(:assessment, type: 'Assessments::Hogan', hogan_assessment_setting: build(:hogan_assessment_setting))
  end
  let(:report) do
    create(:report,
           assessments: [assessment],
           hogan_report_setting: build(:hogan_report_setting),
           provider: :hogan)
  end
  let(:report_family) { create(:report_family) }
  let!(:report_families_report) do
    create(:report_families_report,
           report: report,
           report_family: report_family,
           external_package_id: 'RPtFlashPkgLead')
  end
  let(:user) { create(:user) }
  let(:user_report) { create(:user_report, report: report, report_family: report_family) }
  it 'when credentials are empty we create them' do
    expect(Services::Hogan::API::JSON::GroupDetails).to receive(:call).and_return(double('res', success?: true))
    expect(Services::Hogan::API::JSON::AddParticipantToGroup).to receive(:call!).
      and_return(double('res', participant_id: 1))
    expect(Services::Hogan::API::JSON::AddParticipantAssessment).to receive(:call!)
    expect(Services::Hogan::API::JSON::AddParticipantReport).to receive(:call!)
    Hogan::AddReports.call!(
      group: 'any',
      credentials: nil,
      user_id: user.id,
      assessment: assessment,
      reports: [user_report]
    )

    expect(user.hogan_credential).to be_truthy
  end
  context 'when we have 2 reports with same package' do
    let(:extra_report) do
      create(:report, assessments: [assessment], hogan_report_setting: build(:hogan_report_setting), provider: :hogan)
    end
    let!(:extra_report_families_report) do
      create(:report_families_report,
             report: extra_report,
             report_family: report_family,
             external_package_id: 'RPtFlashPkgLead')
    end
    let(:extra_user_report) { create(:user_report, report: extra_report, report_family: report_family) }

    it 'we call Hogan API once' do
      expect(Services::Hogan::API::JSON::GroupDetails).to receive(:call).and_return(double('res', success?: true))
      expect(Services::Hogan::API::JSON::AddParticipantToGroup).to receive(:call!).
        and_return(double('res', participant_id: 1))
      expect(Services::Hogan::API::JSON::AddParticipantAssessment).to receive(:call!)
      expect(Services::Hogan::API::JSON::AddParticipantReport).to receive(:call!).exactly(1).time
      Hogan::AddReports.call!(
        group: 'any',
        credentials: nil,
        user_id: user.id,
        assessment: assessment,
        reports: [user_report.reload, extra_user_report.reload]
      )

      expect(user.hogan_credential).to be_truthy
    end
  end

  context 'when we have 1 report is our of the package' do
    let(:extra_report) do
      create(:report,
             assessments: [assessment],
             hogan_report_setting: build(:hogan_report_setting, hogan_report_id: 'something_new'),
             provider: :hogan)
    end
    let(:extra_user_report) { create(:user_report, report: extra_report) }

    it 'we call Hogan API two times' do
      expect(Services::Hogan::API::JSON::GroupDetails).to receive(:call).and_return(double('res', success?: true))
      expect(Services::Hogan::API::JSON::AddParticipantToGroup).to receive(:call!).
        and_return(double('res', participant_id: 1))
      expect(Services::Hogan::API::JSON::AddParticipantAssessment).to receive(:call!)
      expect(Services::Hogan::API::JSON::AddParticipantReport).to receive(:call!).exactly(2).time
      Hogan::AddReports.call!(
        group: 'any',
        credentials: nil,
        user_id: user.id,
        assessment: assessment,
        reports: [user_report.reload, extra_user_report.reload]
      )

      expect(user.hogan_credential).to be_truthy
    end
  end
end
