# frozen_string_literal: true

require 'rails_helper'

describe Api::Campaigns::Users::Upsert do
  let!(:campaign) { create(:campaign) }
  let(:form) do
    Api::V1::Users::UpdateForm.new(
      first_name: 'John', last_name: 'Doe', email: Faker::Internet.email, operation: 'add_and
      allow_new_response',
      schedule_start_date: 1.day.from_now, schedule_end_date: 2.days.from_now,
      campaigns: [
        {
          id: campaign.id,
          external_id: '123',
          existing_record: 'add_and_allow_new_response',
          active: true,
          schedule_start_date: 1.day.from_now,
          schedule_end_date: 2.days.from_now
        }
      ]
    )
  end
  let!(:current_user) { create(:user) }

  before(:each) do
    allow(Licenses::Use).to receive(:call!)
  end

  it 'calls create command for each campaign provided in campaigns' do
    # rubocop:disable Style/OpenStructUse
    struct = OpenStruct.new(
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      external_id: form.campaigns.first[:external_id],
      operation: form.campaigns.first[:existing_record],
      active: form.campaigns.first[:active],
      schedule_start_date: form.campaigns.first[:schedule_start_date],
      schedule_end_date: form.campaigns.first[:schedule_end_date]
    )
    # rubocop:enable all

    expect(Campaigns::Users::Create).to receive(:call).with(
      struct, campaign, current_user, user: nil
    ).and_return(ok: User.last)

    response = described_class.call(form, current_user, campaigns: form.campaigns, project: campaign.project)

    expect(response[:ok]).to be_a(User)
  end

  it 'calls create command with user if user is passed' do
    user = create(:user, project: campaign.project)
    form.email = user.email

    # rubocop:disable Style/OpenStructUse
    struct = OpenStruct.new(
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      external_id: form.campaigns.first[:external_id],
      operation: form.campaigns.first[:existing_record],
      active: form.campaigns.first[:active],
      schedule_start_date: form.campaigns.first[:schedule_start_date],
      schedule_end_date: form.campaigns.first[:schedule_end_date]
    )
    # rubocop:enable all

    expect(Campaigns::Users::Create).to receive(:call).with(
      struct, campaign, current_user, user: user
    ).and_return(ok: user)

    response = described_class.call(
      form, current_user, campaigns: form.campaigns, project: campaign.project, user: user
    )

    expect(response[:ok]).to eq(user)
  end

  it 'updates existing campaign user if it already exists' do
    user = create(:user, project: campaign.project)
    campaign_user = create(:campaign_user, campaign: campaign, user: user)

    form.campaigns = [
      {
        id: campaign.id,
        external_id: '123',
        existing_record: 'add_and_allow_new_response',
        active: true,
        schedule_start_date: 1.day.from_now,
        schedule_end_date: 2.days.from_now
      }
    ]

    form.email = user.email
    form.first_name = 'Jane'
    form.last_name = 'Doe'

    expect do
      described_class.call!(form, current_user, campaigns: form.campaigns, project: campaign.project, user: user)
    end.to_not change(User, :count)

    user.reload
    campaign_user.reload
    expect(user.first_name).to eq('Jane')
    expect(user.last_name).to eq('Doe')
    expect(user.email).to eq(user.email)
    expect(user.campaign_users.first).to eq(campaign_user)
    expect(campaign_user.reload.external_id).to eq('123')
  end

  it 'creates user if user is not passed and user with email doesnt exists in system' do
    form.email = Faker::Internet.email
    expect do
      described_class.call!(form, current_user, campaigns: form.campaigns, project: campaign.project)
    end.to change { User.count }.by(1)

    user = User.find_by(email: form.email)
    expect(user).to be_present

    campaign_user = user.campaign_users.first

    expect(campaign_user.schedule_start_date).to eq(1.day.from_now)
    expect(campaign_user.schedule_end_date).to eq(2.days.from_now)
    expect(campaign_user.external_id).to eq('123')
    expect(campaign_user.active).to be_truthy
    expect(user.user_profile).to be_present
  end
end
