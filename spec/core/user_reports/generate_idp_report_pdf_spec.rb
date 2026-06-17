# frozen_string_literal: true

require 'rails_helper'

describe UserReports::GenerateIdpReportPdf do
  include Rails.application.routes.url_helpers

  let!(:user) { create(:user, :with_project_membership) }
  let!(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:idp_template) { create(:idp_template, project: campaign.project) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign, idp_template: idp_template) }
  let!(:current_user) { create(:superadmin) }
  let!(:admin_job_record) do
    create(:admin_job_record, operation: :bulk_download_idp_reports, owner: current_user,
            data: { campaign_id: campaign.id, lang: 'en' })
  end

  before do
    allow(Kernel).to receive(:system)
  end

  describe 'report_preview_url' do
    let(:common_url_params) do
      {
        host: Settings.domain,
        user_token: current_user.authentication_token,
        lang: 'en',
        port: Settings.port,
        protocol: Settings.protocol,
        id: user_idp_plan.id
      }
    end

    before do
      allow(AdminSubdomain).to receive(:host_options_for).
        with(user: current_user, project: campaign.project).
        and_return({})
    end

    it 'returns preview pdf url for administrator' do
      url = described_class.new(user_idp_plan, current_user).send(:report_preview_url)

      expect(url).to eq(
        pdf_preview_administration_new_campaign_user_idp_report_url(
          common_url_params.merge(subdomain: Settings.subdomain, new_campaign_id: user_idp_plan.campaign.id,
                                  include_reflective_questions: false)
        )
      )
    end

    it 'returns preview pdf url with reflective_questions' do
      url = described_class.new(user_idp_plan, current_user,
                                include_reflective_questions: true).send(:report_preview_url)

      expect(url).to eq(
        pdf_preview_administration_new_campaign_user_idp_report_url(
          common_url_params.merge(subdomain: Settings.subdomain, new_campaign_id: user_idp_plan.campaign.id,
                                  include_reflective_questions: true)
        )
      )
    end

    context 'for client administrator' do
      let(:client_admin) { create(:client_admin) }
      let(:client_admin_url_params) do
        {
          host: 'client-admin.tte.com',
          user_token: client_admin.authentication_token,
          lang: 'en',
          port: Settings.port,
          protocol: Settings.protocol,
          id: user_idp_plan.id,
          new_campaign_id: campaign.id
        }
      end

      before do
        allow(AdminSubdomain).to receive(:host_options_for).
          with(user: client_admin, project: campaign.project).
          and_return({ host: 'client-admin.tte.com' })
      end

      it 'returns preview pdf url' do
        url = described_class.new(user_idp_plan, client_admin).send(:report_preview_url)

        expect(url).to eq(
          pdf_preview_administration_new_campaign_user_idp_report_url(
            client_admin_url_params.merge(include_reflective_questions: false)
          )
        )
      end
    end
  end

  context 'using local puppeter' do
    before(:each) do
      allow(Settings).to receive_message_chain(:features, :url_to_pdf_faas) { false }
      frozen_time = Time.zone.local(2020, 1, 1, 12, 0, 0)
      allow(Time.zone).to receive(:now).and_return(frozen_time)
    end

    it 'create report pdf in tmp location where current_user is a super admin' do
      output_path = described_class.call!(user_idp_plan, current_user, { lang: 'en' })[:file_path]

      expect(output_path).to include(
        "tmp/idp_reports/#{user.email}/#{user.email}_idp_report_en_#{Time.zone.now.strftime('%Y-%m-%d_%H-%M-%S')}.pdf"
      )
    end

    it 'create report pdf in tmp location where current_user is a super admin' do
      output_path = described_class.call!(user_idp_plan, current_user,
                                          { lang: 'en', include_reflective_questions: true })[:file_path]

      expect(output_path).to include(
        "tmp/idp_reports/#{user.email}/#{user.email}_idp_report_en_rq_#{
          Time.zone.now.strftime('%Y-%m-%d_%H-%M-%S')}.pdf"
      )
    end

    it 'create report pdf in tmp location where current_user is a regular user' do
      output_path = described_class.call!(user_idp_plan, user, { lang: 'en' })[:file_path]

      expect(output_path).to include(
        "tmp/idp_reports/#{user.email}/#{user.email}_idp_report_en_#{Time.zone.now.strftime('%Y-%m-%d_%H-%M-%S')}.pdf"
      )
    end
  end

  context 'using faas' do
    before(:each) do
      allow(Settings).to receive_message_chain(:features, :url_to_pdf_faas) { true }
    end

    it 'calls Faas::UrlToPdf ' do
      report_url = 'https://cc.com/abc.pdf'
      report_file_name = 'abc.pdf'
      allow_any_instance_of(described_class).to receive(:report_preview_url).and_return(report_url)
      allow_any_instance_of(described_class).to receive(:report_file_name).and_return(report_file_name)
      expect(Faas::UrlToPdf).to receive(:call!).with(
        { width: '1122px', height: '793px' }.merge(
          file_name: report_file_name,
          url: report_url,
          low_priority: nil,
          output_file_path: "path/to/pdf/#{report_file_name}",
          webhook_message: {
            record_id: user_idp_plan.id,
            record_type: 'UserIdpPlan',
            file_name: report_file_name,
            file_path: "path/to/pdf/#{report_file_name}",
            update_record: true,
            lang: 'en',
            admin_job_record_id: admin_job_record.id,
            async_request_uuid: 'abcd',
            include_reflective_questions: true
          },
          meta: {
            file_attribute: 'pdf_file',
            campaign_id: user_idp_plan.campaign_id,
            record_id: user_idp_plan.id,
            record_type: 'UserIdpPlan',
            user_id: user_idp_plan.user_id,
            project_id: user_idp_plan.campaign.project_id
          },
          pdf_password: user_idp_plan.campaign.pdf_password
        )
      )

      described_class.call!(
        user_idp_plan, user,
        {
          lang: 'en',
          file_path: 'path/to/pdf',
          admin_job_record_id: admin_job_record.id,
          include_reflective_questions: true,
          async_request_uuid: 'abcd'
        }
      )
    end
  end
end
