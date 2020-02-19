# frozen_string_literal: true

require 'rails_helper'

describe Users::CreateAnonym do
  describe 'Creating user' do
    let(:client) { create(:campaign_base) }

    it 'succeeds' do
      user = Users::CreateAnonym.call!(client)
      expect(user.persisted?).to be_truthy
      expect(user.is_anonym?).to be_truthy
    end
  end
end
