# frozen_string_literal: true

require 'rails_helper'

RSpec.describe MagicLinkLoginMailer, type: :mailer do
  describe 'magic_link_email' do
    let(:project) { create(:project) }
    let(:user) { create(:user, email: 'user@example.com', first_name: 'John', last_name: 'Doe', project: project) }
    let(:mail) { described_class.magic_link_email(user) }

    context 'headers' do
      it 'renders the subject' do
        expect(mail.subject).to eq('Signin link for Lighthouse')
      end

      it 'sends to the right email' do
        expect(mail.to).to eq([user.email])
      end

      it 'renders the from email' do
        expect(mail.from).to eq(["no-reply@#{Settings.domain}"])
      end
    end

    context 'body' do
      it 'includes the user display name' do
        expect(mail.body.encoded).to match(user.decorate.display_name)
      end

      it 'includes the greeting' do
        expect(mail.body.encoded).to match('Greetings for the day!')
      end

      it 'includes the instructions' do
        expect(mail.body.encoded).to match('Click below link to signin to lighthouse.')
      end

      it 'includes the magic link URL' do
        magic_link_url = Utility::Url.generate(
          :users_sign_in_link_url,
          id: user.id,
          subdomain: user.subdomain
        )

        expect(mail.body.encoded).to include(magic_link_url)
      end

      it 'includes the sign-in link text' do
        expect(mail.body.encoded).to include(I18n.t('mailer.magic_link.body.signin_link'))
      end
    end
  end
end
