# frozen_string_literal: true

require 'rails_helper'

describe ::UsersResults::UpdatingForm do
  subject { described_class.new }
  it do
    is_expected.to respond_to(:status, :answers, :embedded_data, :norm_id)
  end

  describe 'with user result' do
    let(:user_result) { create(:users_result) }
    let(:form) { described_class.new.with_context(user_result: user_result) }

    it 'should be invalid' do
      expect(form).to be_invalid
    end
  end

  describe 'with user result' do
    let(:user_result) { create(:users_result, status: :in_progress) }
    let(:form) { described_class.new.with_context(user_result: user_result) }

    it 'should be valid for in progress' do
      expect(form).to be_valid
    end
  end
end
