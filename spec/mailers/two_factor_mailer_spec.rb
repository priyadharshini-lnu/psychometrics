# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TwoFactorMailer, type: :mailer do
  describe 'two_factor_code_email' do
    context 'headers' do
      it 'renders the subject' do
        user = build(:user)

        mail = described_class.two_factor_code_email(user, '123456')

        expect(mail.subject).to eq I18n.t('two_factor.email.otp.subject')
      end

      it 'sends to the right email' do
        user = build(:user)

        mail = described_class.two_factor_code_email(user, '123456')

        expect(mail.to).to eq [user.email]
      end

      it 'renders the from email' do
        user = build(:user)

        mail = described_class.two_factor_code_email(user, '123456')

        expect(mail.from).to eq ["no-reply@#{Settings.domain}"]
      end
    end

    it 'includes the correct one time password code' do
      user = build(:user)

      mail = described_class.two_factor_code_email(user, '123456')

      expect(mail.body.encoded).to include '123456'
    end
  end
end
