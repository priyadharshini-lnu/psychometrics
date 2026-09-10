# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Communications::Emails::Retrigger do
  # CommunicationEmail#redeliver! (after_commit on: :create) enqueues the real mailer job on every
  # create. Stubbed here so these specs focus on Retrigger's own behaviour rather than a real send.
  before { allow_any_instance_of(CommunicationEmail).to receive(:redeliver!) }

  let(:client) { create(:tenancy) }
  let(:project) { create(:project, parent: client) }
  let(:campaign) { create(:campaign, project: project) }
  let(:delivery) { create(:communication_delivery, client: client, project: project, campaign: campaign) }
  let(:user) { create(:user) }
  let(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let(:communication_email) do
    create(:communication_email, communication: nil, communication_delivery: delivery, campaign_user: campaign_user,
                                  user: user)
  end

  context 'when the email is failed' do
    before do
      communication_email.update!(status: :failed, error_code: 'Net::SMTPFatalError', error_message: 'boom')
    end

    it 'clears the error fields and redelivers the email' do
      expect(communication_email).to receive(:redeliver!)

      result = described_class.call(communication_email)

      expect(result[:ok]).to eq(communication_email)
      expect(communication_email.reload.error_code).to be_nil
      expect(communication_email.reload.error_message).to be_nil
    end
  end

  %i[pending queued sent skipped cancelled].each do |status|
    context "when the email is #{status}" do
      before { communication_email.update!(status: status) }

      it 'does not redeliver and broadcasts :invalid_status' do
        expect(communication_email).not_to receive(:redeliver!)

        result = described_class.call(communication_email)

        expect(result[:invalid_status]).to eq(communication_email)
      end
    end
  end
end
