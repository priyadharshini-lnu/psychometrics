# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserReport, type: :model do
  it { should belong_to(:user).inverse_of(:user_reports) }
  it { should belong_to(:report) }
  it { should belong_to(:campaign) }

  it { should define_enum_for(:status).with_values(not_prepared: 0, generating: 1, failed: 2, prepared: 3) }

  describe '#attach_pdf!' do
    let(:user_report) { create(:user_report) }

    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)
    end

    context 'when data is String' do
      context 'when string is a URL' do
        let(:data) { 'http://example.com/test.pdf' }
        let(:file) do
          Rack::Test::UploadedFile.new(Rails.root.join('spec/fixtures/files/reports/test.pdf'), 'application/pdf')
        end
        let(:user_report) { create(:user_report) }

        before do
          allow(OpenURI).to receive(:open_uri).with(URI.parse(data)).and_return(file)
        end

        it 'attaches the PDF from the URL' do
          user_report.attach_pdf!(data)
          expect(user_report.user_report_pdf.pdf_file).to be_attached
          expect(user_report.user_report_pdf.pdf_file.key).to match(
            %r{private/projects/#{user_report.project.id}/user_reports/#{user_report.id}/#{user_report.effective_default_language}/user_report_pdf/#{user_report.user_report_pdf.id}/pdf_file/\w+_test.pdf} # rubocop:disable Layout/LineLength
          )
        end
      end

      context 'when string is not url' do
        let(:data) { Base64.encode64(Rails.root.join('spec/fixtures/files/reports/test.pdf').read) }
        let(:attachment) { { io: StringIO.new(data), filename: 'test', content_type: 'application/pdf' } }

        before do
          allow(ActiveStorageSupport::Base64Attach).to receive(:attachment_from_data).and_return(attachment)
        end

        it 'attaches the PDF from the base64 string' do
          user_report.attach_pdf!(data, 'test.pdf')
          expect(user_report.user_report_pdf.pdf_file).to be_attached
          expect(user_report.user_report_pdf.pdf_file.key).to match(
            %r{private/projects/#{user_report.project.id}/user_reports/#{user_report.id}/#{user_report.effective_default_language}/user_report_pdf/#{user_report.user_report_pdf.id}/pdf_file/\w+_test.pdf} # rubocop:disable Layout/LineLength
          )
        end
      end
    end

    context 'when data is a File' do
      let(:data) { Rails.root.join('spec/fixtures/files/reports/test.pdf').open }

      it 'attaches the PDF from the file' do
        user_report.attach_pdf!(data)
        expect(user_report.user_report_pdf.pdf_file).to be_attached
        expect(user_report.user_report_pdf.pdf_file.key).to match(
          %r{private/projects/#{user_report.project.id}/user_reports/#{user_report.id}/#{user_report.effective_default_language}/user_report_pdf/#{user_report.user_report_pdf.id}/pdf_file/\w+_test.pdf} # rubocop:disable Layout/LineLength
        )
      end
    end
  end

  require 'rails_helper'

  describe 'schedule_report_available_notification' do
    let(:user) { create(:user) }
    let(:campaign_user) { create(:campaign_user, user: user) }
    let(:user_report) do
      create(:user_report, user: user, campaign_id: campaign_user.campaign_id, user_access: true)
    end
    let(:communication) do
      create(:communication, kind: :report_available, campaign_id: user_report.campaign_id,
                              client: campaign_user.campaign.project.parent)
    end

    context 'when status changes to prepared and communication exists' do
      it 'creates communication emails with the same resource' do
        communication

        user_report.update!(status: 'prepared')

        expect(CommunicationEmail.count).to eq(1)
        communication_email = CommunicationEmail.last

        expect(communication_email.communication).to eq(communication)
        expect(communication_email.user).to eq(user)
        expect(communication_email.campaign_user).to eq(campaign_user)
        expect(communication_email.communication_email_resources.first.resource).to eq(user_report)
      end

      context 'when user_access is set to true' do
        before { user_report.update!(user_access: false, status: 'prepared') }

        it 'creates communication emails' do
          communication
          expect(user_report).to receive(:schedule_report_available_notification).and_call_original
          user_report.update!(user_access: true)

          expect(CommunicationEmail.count).to eq(1)
        end
      end
    end

    context 'when status changes to prepared but no communication exists' do
      it 'does not create any communication emails' do
        user_report.update!(status: 'prepared')

        expect(CommunicationEmail.count).to eq(0)
      end
    end

    context 'when status is not prepared' do
      it 'does not trigger email creation' do
        user_report.update!(status: 'not_prepared')

        expect(CommunicationEmail.count).to eq(0)
      end
    end

    context 'when a report_available delivery exists (Template/Delivery system)' do
      let(:delivery) { create(:communication_delivery, :report_available, campaign: campaign_user.campaign) }

      context 'and use_new_communication_center is enabled for the client' do
        before { campaign_user.campaign.project.parent.client_feature.update!(use_new_communication_center: true) }

        it 'creates a communication_email sourced from the delivery' do
          delivery

          user_report.update!(status: 'prepared')

          expect(CommunicationEmail.count).to eq(1)
          communication_email = CommunicationEmail.last

          expect(communication_email.communication_delivery).to eq(delivery)
          expect(communication_email.user).to eq(user)
          expect(communication_email.campaign_user).to eq(campaign_user)
          expect(communication_email.communication_email_resources.first.resource).to eq(user_report)
        end

        it 'does not resend once already sent via the delivery, but does not block a later status flip either' do
          delivery

          user_report.update!(status: 'prepared')
          expect(CommunicationEmail.count).to eq(1)

          user_report.update!(status: 'not_prepared')
          user_report.update!(status: 'prepared')

          expect(CommunicationEmail.count).to eq(1)
        end

        context 'when a legacy Communication is also configured for the same campaign' do
          it 'sends the delivery-sourced email only -- the flag suppresses the legacy send' do
            communication
            delivery

            user_report.update!(status: 'prepared')

            expect(CommunicationEmail.count).to eq(1)
            expect(CommunicationEmail.where(communication_delivery: delivery).count).to eq(1)
            expect(CommunicationEmail.where(communication: communication)).to be_empty
          end
        end
      end

      context 'and use_new_communication_center is disabled for the client (default)' do
        it 'does not create a communication_email, even though an active delivery exists' do
          delivery

          user_report.update!(status: 'prepared')

          expect(CommunicationEmail.count).to eq(0)
        end

        context 'when a legacy Communication is also configured for the same campaign' do
          it 'sends the legacy email only' do
            communication
            delivery

            user_report.update!(status: 'prepared')

            expect(CommunicationEmail.count).to eq(1)
            expect(CommunicationEmail.where(communication: communication).count).to eq(1)
            expect(CommunicationEmail.where(communication_delivery: delivery)).to be_empty
          end
        end
      end
    end
  end

  describe '#subject association' do
    let(:user) { create(:user) }
    let(:first_campaign) { create(:campaign, :threesixty) }
    let(:second_campaign) { create(:campaign, :threesixty) }

    let!(:first_subject) do
      create(:threesixty_subject, user: user, campaign: first_campaign, evaluation_status: 'completed')
    end
    let!(:second_subject) do
      create(:threesixty_subject, user: user, campaign: second_campaign, evaluation_status: 'in_progress')
    end

    let(:user_report) { create(:user_report, user: user, campaign: first_campaign) }

    context 'when user is a subject in multiple campaigns' do
      it 'returns the subject from the same campaign as the user_report' do
        # This test would FAIL without the campaign_id scope in the association
        # because it would just match by user_id and could return subject from any campaign
        expect(user_report.subject).to eq(first_subject)
        expect(user_report.subject).not_to eq(second_subject)
      end

      it 'returns the correct subject with matching campaign_id' do
        expect(user_report.subject.campaign_id).to eq(user_report.campaign_id)
        expect(user_report.subject.campaign_id).to eq(first_campaign.id)
      end

      it 'returns the correct subject status for the campaign' do
        expect(user_report.subject.evaluation_status).to eq('completed')
      end
    end

    context 'when checking subject from different campaign' do
      let(:second_user_report) { create(:user_report, user: user, campaign: second_campaign) }

      it 'returns different subjects for reports in different campaigns' do
        expect(user_report.subject).to eq(first_subject)
        expect(second_user_report.subject).to eq(second_subject)
        expect(user_report.subject).not_to eq(second_user_report.subject)
      end

      it 'each subject matches its corresponding campaign' do
        expect(user_report.subject.campaign_id).to eq(first_campaign.id)
        expect(second_user_report.subject.campaign_id).to eq(second_campaign.id)
      end
    end

    context 'when subject does not exist for the campaign' do
      let(:third_campaign) { create(:campaign, :threesixty) }
      let(:third_user_report) { create(:user_report, user: user, campaign: third_campaign) }

      it 'returns nil when no subject exists for that campaign' do
        expect(third_user_report.subject).to be_nil
      end
    end
  end
  describe '#generatable?' do
    let(:user) { create(:user) }
    let(:campaign) { create(:campaign) }
    let(:report) { create(:report) }
    let(:user_report) { create(:user_report, user: user, campaign: campaign, report: report) }
    let!(:campaign_user) { create(:campaign_user, user: user, campaign: campaign) }

    before do
      allow(user_report).to receive(:report_modules_empty?).and_return(false)
    end

    context 'when 360 report' do
      let(:campaign) { create(:campaign, :threesixty) }
      let!(:threesixty_subject) { create(:threesixty_subject, user: user, campaign: campaign) }

      before do
        allow(user_report).to receive(:threesixty?).and_return(true)
      end

      it 'returns true when all conditions are met' do
        expect(user_report).to be_generatable
      end

      it 'returns false when report_modules_empty? is true' do
        allow(user_report).to receive(:report_modules_empty?).and_return(true)
        expect(user_report).not_to be_generatable
      end

      context 'with approval workflow' do
        let(:approval_setting) { create(:report_approval_setting, report: report, campaign: campaign) }

        before do
          approval_setting
          user_report.reload
        end

        it 'returns true if approved' do
          user_report.update!(approval_status: 'approved')
          expect(user_report).to be_generatable
        end

        it 'returns false if not approved' do
          user_report.update!(approval_status: 'not_ready')
          expect(user_report).not_to be_generatable
        end
      end

      context 'with AI artifacts' do
        before do
          allow(report).to receive(:campaign_ai_artifacts).and_return(['artifact'])
        end

        it 'returns true if artifacts finalized' do
          campaign_user.update!(campaign_artifact_results_finalized: true)
          expect(user_report).to be_generatable
        end

        it 'returns false if artifacts not finalized' do
          campaign_user.update!(campaign_artifact_results_finalized: false)
          expect(user_report).not_to be_generatable
        end
      end
    end

    context 'when common report' do
      before do
        allow(user_report).to receive(:threesixty?).and_return(false)
        allow(user_report).to receive(:provider_custom_upload?).and_return(false)
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(true)
        allow(user_report).to receive(:external_report?).and_return(false)
        allow(user_report).to receive(:report_modules_empty?).and_return(false)
      end

      it 'returns true when all valid' do
        expect(user_report).to be_generatable
      end

      it 'returns false if provider_custom_upload?' do
        allow(user_report).to receive(:provider_custom_upload?).and_return(true)
        expect(user_report).not_to be_generatable
      end

      it 'returns false if assessments not scored' do
        allow(user_report).to receive(:all_assessments_are_scored?).and_return(false)
        expect(user_report).not_to be_generatable
      end
    end
  end

  describe '#attach_pdf! with skill gap report analysis' do
    let(:user) { create(:user) }
    let(:campaign) { create(:campaign) }
    let(:report) { create(:report) }
    let(:user_report) { create(:user_report, user: user, campaign: campaign, report: report) }
    let(:data) { Rails.root.join('spec/fixtures/files/reports/test.pdf').open }

    before do
      allow_any_instance_of(ActiveStorageAttachable).to receive(:disk_service?).and_return(false)
    end

    context 'when report is linked to active IDP plan with AI assistant' do
      let(:ai_assistant) { create(:assistant) }
      let(:idp_template) do
        create(:idp_template,
               project: campaign.project,
               report: report,
               skill_gap_report_analysis_ai_assistant: ai_assistant)
      end
      let!(:user_idp_plan) do
        create(:user_idp_plan,
               user: user,
               campaign: campaign,
               idp_template: idp_template,
               active: true)
      end

      it 'schedules skill gap report analysis job' do
        expect(Idp::PrecomputeSkillGapReportAnalysisJob).to receive(:perform_later).with(user_report.id)

        user_report.attach_pdf!(data)
      end
    end

    context 'when report is not linked to any IDP template' do
      it 'does not schedule skill gap report analysis job' do
        expect(Idp::PrecomputeSkillGapReportAnalysisJob).not_to receive(:perform_later)

        user_report.attach_pdf!(data)
      end
    end

    context 'when IDP template has no AI assistant configured' do
      let(:idp_template) do
        create(:idp_template,
               project: campaign.project,
               report: report,
               skill_gap_report_analysis_ai_assistant: nil)
      end
      let!(:user_idp_plan) do
        create(:user_idp_plan,
               user: user,
               campaign: campaign,
               idp_template: idp_template,
               active: true)
      end

      it 'does not schedule skill gap report analysis job' do
        expect(Idp::PrecomputeSkillGapReportAnalysisJob).not_to receive(:perform_later)

        user_report.attach_pdf!(data)
      end
    end

    context 'when user IDP plan is not active' do
      let(:ai_assistant) { create(:assistant) }
      let(:idp_template) do
        create(:idp_template,
               project: campaign.project,
               report: report,
               skill_gap_report_analysis_ai_assistant: ai_assistant)
      end
      let!(:user_idp_plan) do
        create(:user_idp_plan,
               user: user,
               campaign: campaign,
               idp_template: idp_template,
               active: false)
      end

      it 'does not schedule skill gap report analysis job' do
        expect(Idp::PrecomputeSkillGapReportAnalysisJob).not_to receive(:perform_later)

        user_report.attach_pdf!(data)
      end
    end
  end
end
