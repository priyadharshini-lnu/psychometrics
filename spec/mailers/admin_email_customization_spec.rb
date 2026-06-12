# frozen_string_literal: true

require 'rails_helper'

describe 'Admin Email Customization', type: :mailer do
  let(:project) { create(:project) }
  let(:user) { create(:user, project: project) }
  let(:client) { project.ancestors.first || project }
  let(:smtp_setting) { client.smtp_setting || create(:smtp_setting, project: client) }

  before do
    smtp_setting.update(enabled: true, from_name: 'Custom Admin', from_email: 'custom@cc.com')
  end

  describe 'UserMailer' do
    it 'inactivity_warning sends with custom name and custom address and specific delivery method settings' do
      smtp_setting.update(host: 'custom_client_host.com')
      mail = UserMailer.inactivity_warning(user)
      expect(mail.from).to eq(['custom@cc.com'])
      expect(mail[:from].value).to eq('Custom Admin <custom@cc.com>')
      expect(mail.delivery_method.settings[:address]).to eq('custom_client_host.com')
    end
  end

  describe 'InvitationMailer' do
    it 'invite_admin sends with custom name and custom address' do
      allow(User).to receive(:find).with(user.id).and_return(user)
      mail = InvitationMailer.invite_admin(user.id, 'token')

      expect(mail.from).to eq(['custom@cc.com'])
      expect(mail[:from].value).to eq('Custom Admin <custom@cc.com>')
    end

    it 'link_to_client includes client admin subdomain URL' do
      membership = create(:membership, user: user, client: project)
      mail = InvitationMailer.link_to_client(user.id, membership)

      expect(mail.body.encoded).to include(client.admin_url)
    end
  end

  describe 'WorkshopFacilitatorsMailer' do
    let(:campaign) { create(:campaign, project: project) }
    let(:workshop) { create(:workshop, campaign: campaign) }

    it 'booking_email sends with custom name and custom address' do
      mail = WorkshopFacilitatorsMailer.booking_email(workshop, user)
      expect(mail.from).to eq(['custom@cc.com'])
      expect(mail[:from].value).to eq('Custom Admin <custom@cc.com>')
    end
  end

  describe 'ReportApprovalNotificationMailer' do
    let(:campaign) { create(:campaign, project: project) }
    let(:report) { create(:report) }
    let(:user_report) { create(:user_report, user: user, campaign: campaign, report: report) }

    it 'notify sends with custom name and custom address' do
      mail = ReportApproving::ReportApprovalNotificationMailer.notify(user_report, user)
      expect(mail.from).to eq(['custom@cc.com'])
      expect(mail[:from].value).to eq('Custom Admin <custom@cc.com>')
    end
  end
  describe 'LicenseMailer' do
    it 'license_expire sends with custom name and custom address' do
      allow(User).to receive(:find).with(user.id).and_return(user)
      mail = LicenseMailer.license_expire(user.id)

      expect(mail.from).to eq(['custom@cc.com'])
      expect(mail[:from].value).to eq('Custom Admin <custom@cc.com>')
    end
  end

  describe 'BulkReportMailer' do
    let(:report) { create(:bulk_report, user: user) }

    it 'notify sends with custom name and custom address' do
      mail = BulkReportMailer.notify(report)
      expect(mail.from).to eq(['custom@cc.com'])
      expect(mail[:from].value).to eq('Custom Admin <custom@cc.com>')
    end
  end

  describe 'Idp::CommentNotificationMailer' do
    let(:campaign) { create(:campaign, project: project) }

    it 'manager_unread_comments sends with custom name and custom address' do
      allow(User).to receive(:find).with(user.id).and_return(user)
      allow(Campaign).to receive(:find).with(campaign.id).and_return(campaign)

      mail = Idp::CommentNotificationMailer.manager_unread_comments(user.id, campaign.id)
      expect(mail.from).to eq(['custom@cc.com'])
      expect(mail[:from].value).to eq('Custom Admin <custom@cc.com>')
    end
  end
end
