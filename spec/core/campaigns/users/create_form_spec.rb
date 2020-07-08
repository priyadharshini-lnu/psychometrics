# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::CreateForm do
  let(:campaign) { create(:campaign) }
  let(:attributes) { { first_name: 'John', last_name: 'Doe', email: 'john@cc.com', operation: 'skip_existing' } }
  let(:user_attributes) { attributes.except(:operation) }

  it 'validates presence of first_name' do
    form = described_class.new(attributes.merge(first_name: '')).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:first_name]).to include("can't be blank")
  end

  it 'validates presence of last_name' do
    form = described_class.new(attributes.merge(last_name: '')).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:last_name]).to include("can't be blank")
  end

  it 'validates presence email' do
    form = described_class.new(attributes.merge(email: '')).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:email]).to include("can't be blank")
  end

  it 'validates format email' do
    form = described_class.new(attributes.merge(email: 'john')).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:email]).to include('is invalid')
  end

  it 'gives error if user with the email is already present in the campaign' do
    user = create(:user, user_attributes)
    create(:campaigns_user, campaign: campaign, user: user)
    form = described_class.new(attributes).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:email]).to include('User with this email id already exists in the campaign')
  end

  it "gives error if use is present in the project and 'skip_existing' operation is userd" do
    create(:user, user_attributes.merge(project_id: campaign.project_id))
    form = described_class.new(attributes.merge(operation: 'skip_existing')).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:email]).to include('User with this email id already exists in the project')
  end

  it 'passes all validations' do
    form = described_class.new(attributes).with_context(campaign: campaign)

    expect(form.valid?).to eq(true)
  end
end
