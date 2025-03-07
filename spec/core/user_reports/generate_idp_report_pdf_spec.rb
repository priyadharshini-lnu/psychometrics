# frozen_string_literal: true

require 'rails_helper'

describe UserReports::GenerateIdpReportPdf do
  include Rails.application.routes.url_helpers

  let!(:user) { create(:user, :with_project_membership) }
  let!(:campaign) { create(:campaign, project_id: user.project_id) }
  let!(:idp_template) { create(:idp_template, project: campaign.project) }
  let!(:user_idp_plan) { create(:user_idp_plan, user: user, campaign: campaign, idp_template: idp_template) }
  let!(:current_user) { create(:superadmin) }

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

    it 'returns preview pdf url for administrator' do
      url = described_class.new(user_idp_plan, current_user).send(:report_preview_url)

      expect(url).to eq(
        pdf_preview_administration_new_campaign_user_idp_report_url(
          common_url_params.merge(subdomain: Settings.subdomain, new_campaign_id: user_idp_plan.campaign.id)
        )
      )
    end
  end

  context 'using local puppeter' do
    before(:each) do
      allow(Settings).to receive_message_chain(:features, :url_to_pdf_lambda) { false }
      frozen_time = Time.zone.local(2020, 1, 1, 12, 0, 0)
      allow(Time.zone).to receive(:now).and_return(frozen_time)
    end

    it 'create report pdf in tmp location where current_user is a super admin' do
      output_path = described_class.call!(user_idp_plan, current_user)[:file_path]

      expect(output_path).to include(
        "tmp/idp_reports/#{user.email}/#{user.email}_idp_report_#{Time.zone.now.strftime('%Y-%m-%d_%H-%M-%S')}.pdf"
      )
    end

    it 'create report pdf in tmp location where current_user is a regular user' do
      output_path = described_class.call!(user_idp_plan, user)[:file_path]

      expect(output_path).to include(
        "tmp/idp_reports/#{user.email}/#{user.email}_idp_report_#{Time.zone.now.strftime('%Y-%m-%d_%H-%M-%S')}.pdf"
      )
    end
  end

  context 'using lambda' do
    before(:each) do
      allow(Settings).to receive_message_chain(:features, :url_to_pdf_lambda) { true }
    end

    it 'calls Lambdas::UrlToPdf ' do
      report_url = 'https://cc.com/abc.pdf'
      report_file_name = 'abc.pdf'
      allow_any_instance_of(described_class).to receive(:report_preview_url).and_return(report_url)
      allow_any_instance_of(described_class).to receive(:report_file_name).and_return(report_file_name)
      expect(Lambdas::UrlToPdf).to receive(:call!).with(
        { width: '849px', height: '1100px' }.merge(
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
            lang: 'en'
          },
          meta: {
            file_attribute: 'pdf_file',
            campaign_id: user_idp_plan.campaign_id,
            record_id: user_idp_plan.id,
            record_type: 'UserIdpPlan',
            user_id: user_idp_plan.user_id,
            project_id: user_idp_plan.campaign.project_id
          },
          async: nil,
          pdf_password: user_idp_plan.campaign.pdf_password
        )
      )

      described_class.call!(user_idp_plan, user, { lang: 'en', file_path: 'path/to/pdf' })
    end
  end
end
