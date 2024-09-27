# frozen_string_literal: true

require 'rails_helper'

describe Users::MagicLinkLoginForm do
  subject { described_class.new(email: email) }

  describe 'validations' do
    context 'when email is present and valid' do
      let(:email) { 'user@example.com' }

      it 'is valid' do
        expect(subject).to be_valid
      end
    end

    context 'when email is missing' do
      let(:email) { nil }

      it 'is not valid' do
        expect(subject).not_to be_valid
        expect(subject.errors[:email]).to include("can't be blank")
      end
    end

    context 'when email is invalid' do
      let(:email) { 'invalid_email' }

      it 'is not valid' do
        expect(subject).not_to be_valid
        expect(subject.errors[:email]).to include('Email is invalid')
      end
    end
  end
end
