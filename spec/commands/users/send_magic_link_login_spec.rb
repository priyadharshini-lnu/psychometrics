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

    context 'when the communication is not found' do
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
