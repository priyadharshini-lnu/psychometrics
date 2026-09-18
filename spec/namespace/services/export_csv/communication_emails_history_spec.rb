# frozen_string_literal: true

require 'rails_helper'
require 'csv'

RSpec.describe Services::ExportCsv::CommunicationEmailsHistory, type: :service do
  let(:campaign) { create(:campaign) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign) }
  let(:subject_user) { campaign_user.user }

  def exported_table(communication)
    csv = described_class.call(communication: communication).result
    CSV.parse(csv, headers: true)
  end

  context 'when the communication is not a completion type' do
    it 'exports the recipient details with the original headers' do
      communication = create(:communication, kind: :invitation, project_campaign: campaign,
        project_id: campaign.project_id)
      email = create(:communication_email, communication: communication, campaign_user: campaign_user,
        membership: create(:membership))
      email.update!(status: :sent, sent_at: Time.current)

      table = exported_table(communication)

      expect(table.headers).to eq(
        ['First Name', 'Last Name', 'Recipient Email', 'Subject Email', 'CC Recipients', 'Sent At']
      )
      expect(table.first['First Name']).to eq(subject_user.first_name)
      expect(table.first['Last Name']).to eq(subject_user.last_name)
      expect(table.first['Recipient Email']).to eq(subject_user.email)
      expect(table.first['Subject Email']).to eq(subject_user.email)
    end

    it 'exports direct recipients when the communication also belongs to a campaign' do
      communication = create(:communication, kind: :magic_link_email,
        project_campaign: campaign, project_id: campaign.project_id)
      email = create(:communication_email, communication: communication, user: subject_user)
      email.update!(status: :sent, sent_at: Time.current)

      row = exported_table(communication).first

      expect(row['First Name']).to eq(subject_user.first_name)
      expect(row['Last Name']).to eq(subject_user.last_name)
      expect(row['Recipient Email']).to eq(subject_user.email)
    end
  end

  context 'when the communication is a completion type' do
    let(:admin) { create(:user) }

    it 'exports the actual recipient when it differs from the subject' do
      user_assessment = create(:user_assessment, subject: subject_user, evaluator: subject_user, campaign: campaign)
      communication = create(:communication, kind: :completion, project_campaign: campaign,
        project_id: campaign.project_id, assessment_id: user_assessment.assessment.id,
        recipients: :selected_admins, user_ids: [admin.id])

      Communications::CompletionTypeJob.perform_now(user_assessment)
      communication.reload.emails.update_all(status: :sent, sent_at: Time.current)

      table = exported_table(communication)

      expect(table.headers).to eq(
        ['First Name', 'Last Name', 'Recipient Email', 'Subject Email', 'CC Recipients', 'Sent At']
      )
      row = table.first
      expect(row['First Name']).to eq(admin.first_name)
      expect(row['Last Name']).to eq(admin.last_name)
      expect(row['Recipient Email']).to eq(admin.email)
      expect(row['Subject Email']).to eq(subject_user.email)
    end

    it 'exports the subject as the recipient for subject-based recipient types' do
      user_assessment = create(:user_assessment, subject: subject_user, evaluator: subject_user, campaign: campaign)
      communication = create(:communication, kind: :completion, project_campaign: campaign,
        project_id: campaign.project_id, assessment_id: user_assessment.assessment.id)

      Communications::CompletionTypeJob.perform_now(user_assessment)
      communication.reload.emails.update_all(status: :sent, sent_at: Time.current)

      row = exported_table(communication).first

      expect(row['First Name']).to eq(subject_user.first_name)
      expect(row['Last Name']).to eq(subject_user.last_name)
      expect(row['Recipient Email']).to eq(subject_user.email)
      expect(row['Subject Email']).to eq(subject_user.email)
    end
  end
end
