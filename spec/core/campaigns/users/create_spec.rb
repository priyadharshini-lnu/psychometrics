# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::Create do
  let(:user_external_id) { Faker::Internet.uuid }
  let(:form) do
    Campaigns::Users::CreateForm.new(
      first_name: 'John', last_name: 'Doe', email: Faker::Internet.email, operation: 'add_and_allow_new_response',
      schedule_start_date: 1.day.from_now, schedule_end_date: 2.days.from_now, locale: 'en'
    )
  end
  let!(:campaign) { create(:campaign) }
  let!(:current_user) { create(:user) }

  it "creates user record if user doesn't exists in the project" do
    expect do
      described_class.call!(form, campaign, current_user)
    end.to change { User.count }.by(1)
  end

  it 'stores user profile locale' do
    described_class.call!(form, campaign, current_user)

    expect(User.last.locale).to eq('en')
  end

  it 'stores UAT flag for newly created users' do
    form.is_uat = true

    described_class.call!(form, campaign, current_user)

    expect(User.last.is_uat).to eq(true)
  end

  it 'stores user profile gender for new user' do
    form.gender = 'male'
    described_class.call!(form, campaign, current_user)

    expect(User.last.user_profile.gender).to eq('male')
  end

  it 'updates user profile gender for existing user' do
    user = create(:user, project_id: campaign.project_id, email: form.email)
    user.user_profile.update!(gender: 'female')
    form.gender = 'not_disclosed'
    described_class.call!(form, campaign, current_user, user: user)

    user.reload
    expect(user.user_profile.gender).to eq('not_disclosed')
  end

  it "doesn't create user record if user already exists in the project" do
    create(:user, email: form.email, project_id: campaign.project_id)
    expect do
      described_class.call!(form, campaign, current_user)
    end.to_not(change { User.count })
  end

  it 'create campaign_user record' do
    user = described_class.call!(form, campaign, current_user)
    campaign_user = user.campaign_users.find_by(campaign: campaign)

    expect(campaign_user.schedule_start_date).to eq(1.day.from_now)
    expect(campaign_user.schedule_end_date).to eq(2.days.from_now)
    expect(campaign_user).to be_present
  end

  it 'adds audit log fro user, user_report and user_assessment' do
    allow(LicenseManager::Deductor).to receive(:call!)
    assessments = create_list(:assessment, 2)
    reports = create_list(:report, 2, assessments: assessments)
    campaign_report1 = create(:campaign_report, campaign: campaign, report: reports[0])
    campaign_report2 = create(:campaign_report, campaign: campaign, report: reports[1])
    create(:campaign_assessment, campaign: campaign, assessment: assessments[0])
    create(:campaign_assessment, campaign: campaign, assessment: assessments[1])

    described_class.call!(form, campaign, current_user)

    user = User.find_by(email: form.email)
    user_create_log = AuditLog.find_by(campaign: campaign, user: current_user, action: 'create', record_id: user)
    time_fields = %i[schedule_start_date schedule_end_date]
    expect(
      user_create_log.payload.deep_symbolize_keys.except(*time_fields)
    ).to eq(form.attributes.except(*time_fields))
    expect(user_create_log.payload['schedule_start_date'].to_time).to eq(form.schedule_start_date)
    expect(user_create_log.payload['schedule_end_date'].to_time).to eq(form.schedule_end_date)

    user_report1 = user.user_reports.find_by(report: reports[0])
    user_report2 = user.user_reports.find_by(report: reports[1])
    user_report_log1 = AuditLog.find_by(campaign: campaign, user: current_user, action: 'create', record: user_report1)
    user_report_log2 = AuditLog.find_by(campaign: campaign, user: current_user, action: 'create', record: user_report2)
    expect(user_report_log1.payload).to eq(
      user_report1.slice(:campaign_id, :report_id, :user_id, :status).merge(
        'operation' => form.operation,
        'user_access' => campaign_report1.user_access,
        'report_family_id' => campaign_report1.report_family_id
      )
    )
    expect(user_report_log2.payload).to eq(
      user_report2.slice(:campaign_id, :report_id, :user_id, :status).merge(
        'operation' => form.operation,
        'user_access' => campaign_report2.user_access,
        'report_family_id' => campaign_report2.report_family_id
      )
    )

    user_assessment1 = user.user_assessments.find_by(assessment: assessments[0])
    user_assessment2 = user.user_assessments.find_by(assessment: assessments[1])
    user_assessment_log1 = AuditLog.find_by(campaign: campaign, user: current_user, action: 'create',
                                            record: user_assessment1)
    user_assessment_log2 = AuditLog.find_by(campaign: campaign, user: current_user, action: 'create',
                                            record: user_assessment2)
    expect(user_assessment_log1.payload).to eq(
      user_assessment1.slice(:campaign_id, :relationship_id, :subject_id, :evaluator_id, :status, :assessment_id).merge(
        'operation' => form.operation
      )
    )
    expect(user_assessment_log2.payload).to eq(
      user_assessment2.slice(:campaign_id, :relationship_id, :subject_id, :evaluator_id, :status, :assessment_id).merge(
        'operation' => form.operation
      )
    )
  end

  context 'add report and license usage' do
    before(:each) do
      assessments = create_list(:assessment, 2)
      reports = create_list(:report, 2, assessments: assessments)
      campaign_report1 = create(:campaign_report, campaign: campaign, report: reports[0])
      create(:campaign_report, campaign: campaign, report: reports[1])
      report_family = campaign_report1.report.report_families.first
      create(
        :license,
        report_family: report_family,
        client: campaign.client,
        start_date: 2.days.ago,
        end_date: 2.days.since
      )
    end

    it 'call Campaigns::Users::AddReport for each campaign_report' do
      expect(Campaigns::Users::AddReport).to receive(:call!).twice

      described_class.call!(form, campaign, current_user)
    end

    it 'calls InvitationMailer if user are created through registration' do
      allow(LicenseManager::Deductor).to receive(:call!)
      expect(InvitationMailer).to receive_message_chain(:invite, :deliver_later)

      described_class.call!(form, campaign)
    end
  end

  context 'create user and assign idp with license usage' do
    before(:each) do
      create(
        :license,
        type: :idp,
        client: campaign.client,
        start_date: 2.days.ago,
        end_date: 2.days.since
      )
      idp_template = create(:idp_template)
      create(:campaign_idp, campaign: campaign, idp_template: idp_template, automatically_assign_new: true)
    end

    it 'calls Idp::AssignUserIdp' do
      expect do
        described_class.call!(form, campaign, current_user)
      end.to change { LicenseUsage.count }.by(1)
    end
  end

  context 'create user and assign idp without license usage should cause error' do
    before(:each) do
      idp_template = create(:idp_template)
      create(:campaign_idp, campaign: campaign, idp_template: idp_template, automatically_assign_new: true)
    end

    it 'calls Idp::AssignUserIdp' do
      expect(described_class.call(form, campaign, current_user)[:insufficient_license]).to eq(
        I18n.t('licenses.not_enough_license', client_name: campaign.client.name, report_name: 'Idp')
      )
    end
  end

  context 'send invite email' do
    let(:user) { create(:user, project_id: campaign.project_id, email: form.email) }
    let(:user1) { create(:user, project_id: campaign.project_id, email: Faker::Internet.email) }
    let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }

    it 'sends email if user is created and do not already exists in campaign' do
      expect do
        described_class.call!(form, campaign, current_user, user: user)
      end.not_to(change { CommunicationEmail.count })
    end

    it 'sends email if user is created and does not exists in campaign' do
      create(
        :communication,
        recipients: :new_users,
        project_campaign: campaign,
        project: campaign.project,
        client: campaign.client,
        kind: :invitation
      )
      expect do
        described_class.call!(form, campaign, current_user, user: user1)
      end.to change { CommunicationEmail.count }.by(1)
    end

    it 'creates an email via an active new_users CommunicationDelivery when there is no legacy Communication ' \
       'and use_new_communication_center is enabled' do
      campaign.client.client_feature.update!(use_new_communication_center: true)
      create(:communication_delivery, campaign: campaign, recipients: :new_users,
                                       communication_template: create(:communication_template, kind: :invitation,
                                                                                                 campaign: campaign))

      expect do
        described_class.call!(form, campaign, current_user, user: user1)
      end.to change { CommunicationEmail.count }.by(1)

      email = CommunicationEmail.last
      expect(email.user).to eq(user1)
      expect(email.communication_delivery.recipients).to eq('new_users')
    end

    it 'does not use the new_users CommunicationDelivery when use_new_communication_center is disabled (default)' do
      create(:communication_delivery, campaign: campaign, recipients: :new_users,
                                       communication_template: create(:communication_template, kind: :invitation,
                                                                                                 campaign: campaign))

      expect do
        described_class.call!(form, campaign, current_user, user: user1)
      end.not_to(change { CommunicationEmail.count })
    end
  end
end
