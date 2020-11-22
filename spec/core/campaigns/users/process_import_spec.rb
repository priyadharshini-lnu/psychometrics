# frozen_string_literal: true

require 'rails_helper'

describe Campaigns::Users::ProcessImport do
  let!(:campaign) { create(:campaign) }
  let!(:current_user) { create(:user) }
  let(:admin_job_record) { create(:admin_job_record) }
  let(:import_data) do
    [
      {
        active: true,
        first_name: 'Fedor',
        last_name: 'Tar',
        email: 'fedor@gmail.com',
        password: 'asdasd',
        created_at: '11 Jul 2020 / 16:39'
      },
      {
        active: false,
        first_name: 'Vlad',
        last_name: 'Ata',
        email: 'vlad@gmail.com',
        password: 'AAA',
        created_at: '11 Jul 2020 / 17:25'
      },
      {
        active: nil,
        first_name: 'Namu',
        last_name: 'Uki',
        email: 'namu@gmail.com',
        password: 'CAMP',
        created_at: '11 Jul 2020 / 17:25'
      }
    ]
  end

  it '.call' do
    campaign.users.create(email: 'vlad@gmail.com', password: 'asdasd')
    campaign.users.create(email: 'namu@gmail.com', password: 'namkhf')

    data = described_class.call!(campaign, current_user, import_data, 'add_with_existing_response', admin_job_record)

    vlad_user = campaign.users.find_by(email: 'vlad@gmail.com')
    vlad_campaign_user = campaign.campaign_users.find_by(user_id: vlad_user.id)

    nam_user = campaign.users.find_by(email: 'namu@gmail.com')
    nam_campaign_user = campaign.campaign_users.find_by(user_id: nam_user.id)

    fedor_user = campaign.users.find_by(email: 'fedor@gmail.com')
    fedor_campaign_user = campaign.campaign_users.find_by(user_id: fedor_user.id)

    expect(vlad_user).to have_attributes(first_name: 'Vlad', last_name: 'Ata')
    expect(fedor_user).to have_attributes(first_name: 'Fedor', last_name: 'Tar')

    expect(
      [
        { email: vlad_user.email, first_name: vlad_user.first_name, last_name: vlad_user.last_name },
        { email: nam_user.email, first_name: nam_user.first_name, last_name: nam_user.last_name }
      ]
    ).to eq(data)
    expect(vlad_campaign_user.active).to be_falsey
    expect(fedor_campaign_user.active).to be_truthy
    expect(nam_campaign_user.active).to be_truthy
  end
end
