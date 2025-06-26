# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AdminJobSteps::BulkDownloadIdpReports::DownloadJob, type: :job do
  describe '#perform' do
    let(:owner) { create(:user) }
    let(:campaign) { create(:campaign) }
    let(:user_idp_plans) { create_list(:user_idp_plan, 3, campaign: campaign) }
    let(:parent_job_record) { create(:admin_job_record, owner: owner, data: { campaign_id: campaign.id }) }
    let(:job_record) do
      create(:admin_job_record, owner: owner, data: { campaign_id: campaign.id }, parent_job_id: parent_job_record.id)
    end
    let(:job) { described_class.new }

    context 'when successful' do
      it 'updates job status and calls BulkDownload service' do
        expect(Idp::BulkDownload).to receive(:call).with(
          user_idp_plans: user_idp_plans,
          current_user: job_record.owner,
          job_record: job_record
        ).and_call_original

        job.perform(job_record)

        expect(job_record.status).to eq('in_progress')
      end
    end

    context 'when an error occurs' do
      before do
        allow(Idp::BulkDownload).to receive(:call).and_raise(StandardError.new('Test error'))
      end

      it 'updates job status to failed and adds error message' do
        job.perform(job_record)

        expect(job_record.status).to eq('failed')
        expect(job_record.error_messages).to include('Test error')
      end
    end
  end
end
