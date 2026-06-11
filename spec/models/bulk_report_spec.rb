# frozen_string_literal: true

require 'rails_helper'

describe BulkReport, type: :model do
  let(:user) { create(:user) }
  let(:report) { BulkReport.create(user_id: user.id) }

  describe '#input_dir' do
    it 'not empty' do
      expect(report.input_dir).not_to be_empty
    end
  end

  describe '#output_dir' do
    it 'not empty' do
      expect(report.output_dir).not_to be_empty
    end
  end

  describe '#expiration_date' do
    it 'responds to :to_date' do
      expect(report.expiration_date).to respond_to(:to_date)
    end
  end

  describe '#public_download_urls' do
    it 'returns valid URIs' do
      expect { URI(report.public_download_urls.first) }.not_to raise_error
    end

    context 'when client admin SSO is enabled' do
      let(:project) { create(:project) }
      let(:client) { project.client }

      before do
        allow(Settings.features).to receive(:client_admin_sso_enabled).and_return(true)
      end

      context 'when bulk report has a campaign' do
        let(:campaign) { create(:campaign, project: project) }
        let(:report_with_campaign) { BulkReport.create(user_id: user.id, campaign: campaign) }

        context 'when user is a client admin' do
          before do
            allow(report_with_campaign.user).to receive(:superadmin?).and_return(false)
          end

          it 'uses campaign client subdomain in URL' do
            url = report_with_campaign.public_download_urls.first
            expect(url).to include("#{client.subdomain}-admin")
          end
        end

        context 'when user is a super admin' do
          before do
            allow(report_with_campaign.user).to receive(:superadmin?).and_return(true)
          end

          it 'uses root domain in URL' do
            url = report_with_campaign.public_download_urls.first
            expect(url).to include(Settings.domain)
            expect(url).not_to include('-admin.')
          end
        end
      end

      context 'when bulk report has no campaign' do
        before do
          allow(report.user).to receive(:superadmin?).and_return(false)
        end

        it 'uses sole_admin_client subdomain in URL' do
          allow(report.user).to receive(:sole_admin_client).and_return(client)
          url = report.public_download_urls.first
          expect(url).to include("#{client.subdomain}-admin")
        end

        it 'uses root domain when user has no sole_admin_client' do
          allow(report.user).to receive(:sole_admin_client).and_return(nil)
          url = report.public_download_urls.first
          expect(url).to include(Settings.domain)
          expect(url).not_to include('-admin.')
        end
      end
    end

    context 'when client admin SSO is disabled' do
      before do
        allow(Settings.features).to receive(:client_admin_sso_enabled).and_return(false)
      end

      it 'uses root domain' do
        url = report.public_download_urls.first
        expect(url).to include(Settings.domain)
        expect(url).not_to include('-admin.')
      end
    end

    context 'with multiple files' do
      before do
        files = [double('file1'), double('file2')]
        allow(report).to receive(:files).and_return(files)
      end

      it 'returns URL for each file with index' do
        urls = report.public_download_urls
        expect(urls.length).to eq(2)
        expect(urls.first).to include('/download/0')
        expect(urls.last).to include('/download/1')
      end
    end
  end

  describe '#private_download_url' do
    before do
      file = double('file', url: '/foo/bar')
      allow(report).to receive(:files).and_return([file])
    end

    it 'returns valid URI' do
      expect { URI(report.private_download_url(0)) }.not_to raise_error
    end
  end
end
