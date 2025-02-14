# frozen_string_literal: true

require 'rails_helper'

describe Hogan::CreateNewHoganCredential do
  let(:project) { create(:project) }
  let(:user) { create(:user, project: project) }
  let(:campaign) { create(:campaign, project: project) }
  let(:hogan_assessment) { create(:hogan_assessment) }
  let(:saville_assessment) { create(:assessment, :saville) }

  let(:hogan_report) { create(:report, :hogan, assessments: [hogan_assessment]) }
  let(:saville_report) { create(:report, :saville, assessments: [saville_assessment]) }

  let!(:hogan_user_assessment) do
    create(:user_assessment, assessment: hogan_assessment, campaign: campaign, subject_id: user.id)
  end
  let!(:saville_user_assessment) do
    create(:user_assessment, assessment: saville_assessment, campaign: campaign, subject_id: user.id)
  end

  let!(:hogan_user_report) do
    create(:user_report, report: hogan_report, campaign: campaign, user: user)
  end
  let!(:saville_user_report) do
    create(:user_report, report: saville_report, campaign: campaign, user: user)
  end

  let(:handle_create_hogan_credential) { described_class.new(user, campaign) }

  describe '#call' do
    before(:each) do
      expect(Services::Hogan::Api::Json::GroupDetails).to receive(:call).and_return(double('res', success?: true))
      expect(Services::Hogan::Api::Json::AddParticipantToGroup).to receive(:call!).
        and_return(1)
    end

    it 'creates hogan credentials' do
      handle_create_hogan_credential.call

      hogan_credential = HoganCredential.last

      expect(hogan_credential.participant_id).to eq('1')
      expect(hogan_credential.provider).to eq('phoenix')
      expect(hogan_credential.norm).to eq('Global2023')
    end

    it 'deletes hogan user assessments' do
      handle_create_hogan_credential.call

      expect(UserAssessment.find_by(assessment_id: hogan_assessment.id, subject_id: user.id)).to be_nil
      expect(UserAssessment.find_by(assessment_id: saville_assessment.id, subject_id: user.id)).not_to be_nil
    end

    it 'deletes hogan user reports' do
      handle_create_hogan_credential.call

      expect(UserReport.find_by(report_id: hogan_report.id, user_id: user.id)).to be_nil
      expect(UserReport.find_by(report_id: saville_report.id, user_id: user.id)).not_to be_nil
    end
  end
end
