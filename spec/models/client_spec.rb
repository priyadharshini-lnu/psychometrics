# frozen_string_literal: true

require 'rails_helper'

describe Client, type: :model do
  it { should have_one(:datasheet).dependent(:destroy).with_foreign_key(:project_id) }

  describe '#hogan_group_name' do
    let(:project) { create(:project) }

    it 'should not be empty' do
      expect(project.reload.hogan_group_name).not_to be_empty
    end

    it 'should be correct' do
      expect(project.reload.hogan_group_name).to eq("#{project.client.name} - #{project.subdomain}")
    end
  end

  describe 'Ransack column filters' do
    let(:user_one) { create(:user) }
    let(:user_two) { create(:user) }

    it 'work on name' do
      FactoryGirl.create_list(:client, 10,
                              number: 101, country: 'UAE', year: '2019',
                               account_manager_id: user_one.id, project_manager_id: user_two.id)
      name = Client.all.sample.name
      specific_client = Client.ransack(filterable_fields: name).result
      all_clients = Client.ransack(filterable_fields: 'Client').result
      expect(specific_client.length).to eq(1)
      expect(all_clients.length).to eq(10)
    end

    it 'work on id' do
      FactoryGirl.create_list(:client, 10,
                              number: 101, country: 'UAE', year: '2019',
                               account_manager_id: user_one.id, project_manager_id: user_two.id)
      id = Client.all.sample.id
      specific_client = Client.ransack(filterable_fields: id).result
      expect(specific_client.length).to be >= 1
    end

    it 'work with erroneous values' do
      FactoryGirl.create_list(:client, 10,
                              number: 101, country: 'UAE', year: '2019',
                               account_manager_id: user_one.id, project_manager_id: user_two.id)
      id = nil
      client = Client.ransack(filterable_fields: id).result
      expect(client.length).to eq(Client.all.count)

      name = ''
      client = Client.ransack(filterable_fields: name).result
      expect(client.length).to eq(Client.all.count)

      random_string = 'this possibly cant be a client name'
      client = Client.ransack(filterable_fields: random_string).result
      expect(client.length).to eq(0)
    end
  end
end
