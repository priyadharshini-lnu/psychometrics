# frozen_string_literal: true

require 'rails_helper'

describe UserReports::GeneratePdf do
  include Rails.application.routes.url_helpers

  let(:user) { create(:user, :with_project_membership) }
  let(:user_report) { create(:user_report, :with_pdf, user: user) }
  let(:report) { user_report.report }
  let(:current_user) { create(:superadmin) }

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
        id: user_report.id
      }
    end

    it 'returns preview pdf url for administrator' do
      url = described_class.new(user_report, current_user).send(:report_preview_url)

      expect(url).to eq(
        pdf_preview_administration_new_campaign_user_report_url(
          common_url_params.merge(subdomain: Settings.subdomain, new_campaign_id: user_report.campaign.id)
        )
      )
    end

    it 'returns preview pdf url for assessor' do
      allow(current_user).to receive(:is?).with(:regular).and_return(false)
      allow(current_user).to receive(:is?).with(:assessor).and_return(true)
      url = described_class.new(user_report, current_user, { view_report_as: :assessor }).send(:report_preview_url)

      expect(url).to eq(pdf_preview_assessors_campaign_user_report_url(
                          common_url_params.merge(subdomain: Settings.subdomain, campaign_id: user_report.campaign.id)
                        ))
    end

    it 'returns preview pdf url for 360 end_user' do
      current_user = create(:user, :with_project_membership)
      campaign = create(:campaign, :threesixty)
      create(:threesixty_campaign, campaign: campaign)
      user_report = create(:user_report, campaign: campaign)
      url = described_class.new(user_report, current_user).send(:report_preview_url)

      expect(url).to eq(
        campaign_report_url(
          common_url_params.merge(
            subdomain: campaign.project.subdomain,
            campaign_id: campaign.threesixty_campaign.id,
            user_token: current_user.authentication_token,
            id: user_report.id,
            format: :pdf
          )
        )
      )
    end

    it 'returns preview pdf url for non 360 end_user' do
      current_user = create(:user, :with_project_membership)
      url = described_class.new(user_report, current_user).send(:report_preview_url)

      expect(url).to eq(pdf_preview_user_report_url(
                          common_url_params.merge(
                            user_token: current_user.authentication_token,
                            subdomain: current_user.project.subdomain
                          )
                        ))
    end
  end

  context 'using local puppeter' do
    before(:each) do
      allow(Settings).to receive_message_chain(:features, :url_to_pdf_lambda) { false }
      frozen_time = Time.zone.local(2020, 1, 1, 12, 0, 0)
      allow(Time.zone).to receive(:now).and_return(frozen_time)
    end

    it 'create report pdf in tmp location where current_user is a super admin' do
      output_path = described_class.call!(user_report, current_user)[:file_path]

      # rubocop:disable Layout/LineLength
      expect(output_path).to include(
        "tmp/reports/#{user.email}/#{user.email}_#{report.decorate.display_name.parameterize(preserve_case: true)}_#{Time.zone.now.strftime('%Y-%m-%d_%H-%M-%S')}.pdf"
      )
      # rubocop:enable Layout/LineLength
    end

    it 'create report pdf in tmp location where current_user is a regular user' do
      output_path = described_class.call!(user_report, user)[:file_path]

      # rubocop:disable Layout/LineLength
      expect(output_path).to include(
        "tmp/reports/#{user.email}/#{user.email}_#{report.decorate.display_name.parameterize(preserve_case: true)}_#{Time.zone.now.strftime('%Y-%m-%d_%H-%M-%S')}.pdf"
      )
      # rubocop:enable Layout/LineLength
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
      expect(::Lambdas::UrlToPdf).to receive(:call!).with(
        report.pdf_dimension.merge(
          file_name: report_file_name,
          url: report_url,
          low_priority: nil,
          output_file_path: user_report.attachment_storage_path(:pdf_file, report_file_name),
          webhook_message: {
            user_report_id: user_report.id,
            file_name: report_file_name,
            file_path: user_report.attachment_storage_path(:pdf_file, report_file_name),
            update_record: true
          },
          meta: {
            campaign_id: user_report.campaign_id,
            report_id: user_report.report_id,
            user_id: user_report.user_id,
            project_id: user_report.campaign.project_id
          },
          async: nil,
          pdf_password: user_report.campaign.pdf_password
        )
      )

      described_class.call!(user_report, user)
    end
  end
end
