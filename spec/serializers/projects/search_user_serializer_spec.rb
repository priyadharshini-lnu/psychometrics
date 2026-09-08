# frozen_string_literal: true

require 'rails_helper'

describe Projects::SearchUserSerializer do
  def serialize(record)
    described_class.new.serialize(record)
  end

  it 'exposes is_uat so the participant form can lock the toggle for existing users' do
    user = create(:user, is_uat: true)

    expect(serialize(user)['is_uat']).to eq(true)
  end

  it 'exposes is_uat as false for a regular user' do
    user = create(:user, is_uat: false)

    expect(serialize(user)['is_uat']).to eq(false)
  end
end
