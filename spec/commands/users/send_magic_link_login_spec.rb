# frozen_string_literal: true

require 'rails_helper'

describe Users::SendMagicLinkLogin do
  let(:project) { create(:project) }
  let(:email) { 'user@example.com' }
  let(:user) { create(:user, email: email) }
  let(:communication) { create(:communication, :magic_link_email, project: project, client: project.client) }

  subject { described_class.new(project, email) }

  describe '#call' do
    context 'when the user is not found' do
      it 'broadcasts :ok' do
        expect(subject).to receive(:broadcast).with(:ok)
        subject.call
      end
    end

    context 'when neither a legacy communication nor a delivery is found' do
      before do
        project.project_users << user
      end

      it 'sends a default email with magic link' do
        mailer_double = double('MagicLinkLoginMailer')
        allow(MagicLinkLoginMailer).to receive(:magic_link_email).with(user).and_return(mailer_double)
        expect(mailer_double).to receive(:deliver_now)

        subject.call
      end
    end

    context 'when an active CommunicationDelivery exists for the project' do
      let(:client) { project.client }
      let!(:delivery) { create(:communication_delivery, :magic_link_email, client: client, project: project) }

      before do
        project.project_users << user
      end

      context 'and use_new_communication_center is enabled for the client' do
        before { client.client_feature.update!(use_new_communication_center: true) }

        it 'creates a CommunicationEmail for the delivery without a legacy fallback' do
          expect(MagicLinkLoginMailer).not_to receive(:magic_link_email)

          expect { subject.call }.to change { delivery.emails.count }.by(1)
          expect(delivery.emails.last.user).to eq(user)
        end
      end

      context 'and use_new_communication_center is disabled for the client (default)' do
        it 'does not use the delivery -- falls through to the default mailer instead' do
          mailer_double = double('MagicLinkLoginMailer')
          allow(MagicLinkLoginMailer).to receive(:magic_link_email).with(user).and_return(mailer_double)
          expect(mailer_double).to receive(:deliver_now)

          expect { subject.call }.not_to(change { delivery.emails.count })
        end
      end
    end

    context 'when the communication exists' do
      before do
        project.project_users << user
        communication
      end

      it 'creates a new email and broadcasts :ok' do
        expect do
          subject.call
        end.to change { communication.emails.count }.by(1)

        expect(subject).to receive(:broadcast).with(:ok)
        subject.call
      end

      it 'fetches the latest communication' do
        latest_communication = create(:communication, :magic_link_email, project: project, client: project.client)

        subject.call
        expect(latest_communication.emails.last.user_id).to eq(user.id)
      end
    end
  end
end
