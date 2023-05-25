# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::CreateForm do
  let(:campaign) { create(:campaign) }
  let(:attributes) do
    {
      first_name: 'John', last_name: 'Doe', email: 'john@cc.com', operation: 'skip_existing',
      schedule_start_date: 1.day.from_now.to_s, schedule_end_date: 2.days.from_now.to_s
    }
  end
  let(:user_attributes) { attributes.except(:operation, :schedule_start_date, :schedule_end_date) }

  it 'validates schedule_start_date is a valid date' do
    form = described_class.new(attributes.merge(schedule_start_date: 'abc')).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:schedule_start_date]).to include('is invalid')
  end

  it 'validates schedule_end_date is a valid date' do
    form = described_class.new(attributes.merge(schedule_end_date: 'abc')).with_context(campaign: campaign)

    expect(form.valid?).to eq(false)
    expect(form.errors[:schedule_end_date]).to include('is invalid')
  end

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
    create(:campaign_user, campaign: campaign, user: user)
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

  it 'validates locale' do
    form = described_class.new(locale: 'invalid').with_context(campaign: campaign)
    form.validate
    expect(form.errors.messages[:locale]).to include('Wrong locale')
  end

  it 'passes all validations' do
    form = described_class.new(attributes).with_context(campaign: campaign)

    expect(form.valid?).to eq(true)
  end
end
