# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::EditForm do
  let!(:campaign) { create(:campaign) }
  let!(:user) { create(:user) }
  let!(:campaign_user) { create(:campaign_user, campaign: campaign, user: user) }
  let!(:attributes) { campaign_user.user.attributes.slice('first_name', 'last_name', 'email') }

  it 'validates presence of first_name' do
    form = described_class.new(attributes.merge(first_name: '')).
           with_context(campaign: campaign, current_campaign_user_id: campaign_user.user.id)

    expect(form.valid?).to eq(false)
    expect(form.errors[:first_name]).to include("can't be blank")
  end

  it 'validates presence of last_name' do
    form = described_class.new(attributes.merge(last_name: '')).
           with_context(campaign: campaign, current_campaign_user_id: campaign_user.user.id)

    expect(form.valid?).to eq(false)
    expect(form.errors[:last_name]).to include("can't be blank")
  end

  it 'validates presence email' do
    form = described_class.new(attributes.merge(email: '')).
           with_context(campaign: campaign, current_campaign_user_id: campaign_user.user.id)

    expect(form.valid?).to eq(false)
    expect(form.errors[:email]).to include("can't be blank")
  end

  it 'validates format email' do
    form = described_class.new(attributes.merge(email: 'john')).
           with_context(campaign: campaign, current_campaign_user_id: campaign_user.user.id)

    expect(form.valid?).to eq(false)
    expect(form.errors[:email]).to include('is invalid')
  end

  it 'validates locale' do
    form = described_class.new(locale: 'invalid').
           with_context(campaign: campaign, current_campaign_user_id: campaign_user.user.id)

    form.validate
    expect(form.errors.messages[:locale]).to include('Wrong locale')
  end

  it 'validates user with this email already exist in campaign' do
    new_user = create(:user)
    create(:campaign_user, campaign: campaign, user: new_user)
    form = described_class.new(email: attributes['email']).
           with_context(campaign: campaign, current_campaign_user_id: new_user.id)

    expect(form.valid?).to eq(false)
    expect(form.errors[:email]).to include('User with this email id already exists in the campaign')
  end
end
