require 'rails_helper'

RSpec.describe Imports::UserImport do
  let!(:client) { create(:project_base) }
  let!(:super_admin) { create(:superadmin) }
  let!(:base_user) { create(:user, project_id: client.project.id) }
  let!(:user_without_password) { create(:user, :skip_validate, password: nil, project_id: client.project.id) }
  let!(:membership1) { create(:membership, client: client, user: base_user) }
  let!(:membership2) { create(:membership, client: client, user: user_without_password) }
  let!(:user_with_password) { membership1.user }
  let!(:headers) do
    [
      [
        Membership.human_attribute_name('active'),
        Membership.human_attribute_name('first_name'),
        Membership.human_attribute_name('last_name'),
        Membership.human_attribute_name('email'),
        Membership.human_attribute_name('password'),
        Membership.human_attribute_name('created_at'),
      ]
    ]
  end
  let!(:body) do
    Array.new(5) do
      ['Yes', Faker::Name.first_name, Faker::Name.last_name, Faker::Internet.email, Faker::Lorem.characters(10),
       Time.current]
    end
  end
  let(:parsed_array) do
    headers + body
  end
  let(:open_spreadsheet) do
    OpenStruct.new(to_a: parsed_array)
  end
  let(:existing_users) do
    [
      [
        'Yes', user_with_password.first_name, user_with_password.last_name, user_with_password.email,
        Faker::Lorem.characters(10), user_with_password.created_at, nil
      ],
      [
        'Yes', user_without_password.first_name, user_without_password.last_name, user_without_password.email,
        Faker::Lorem.characters(10), user_without_password.created_at, nil
      ]
    ]
  end

  before(:each) do
    @file = StringIO.new
    @file.class.class_eval { attr_accessor :content_type }
    @file.content_type = 'text/csv'
  end

  describe '#process!' do
    context 'All users are new' do
      before(:each) do
        allow_any_instance_of(Imports::UserImport).to receive(:open_spreadsheet).and_return(open_spreadsheet)
      end

      it 'should create new users' do
        import = Imports::UserImport.new(client_id: client.id, importer: super_admin, file: @file)
        expect { import.process! }.to change { client.users.count }.by(body.size)
      end

      it 'should not add new user to existing_users_whose_password_not_changed' do
        import = Imports::UserImport.new(client_id: client.id, importer: super_admin, file: @file)
        import.process!
        expect(import.existing_users_whose_password_not_changed).to be_empty
      end
    end

    context 'With existing user' do
      before(:each) do
        existing_users.each {|user| body << user }
        allow_any_instance_of(Imports::UserImport).to receive(:open_spreadsheet).and_return(open_spreadsheet)
      end

      it 'should add only new users' do
        import = Imports::UserImport.new(client_id: client.id, importer: super_admin, file: @file)
        expect { import.process! }.to change { client.users.count }.by(body.size - existing_users.size)
      end

      it 'should update password for existing user without password' do
        import = Imports::UserImport.new(client_id: client.id, importer: super_admin, file: @file)
        expect { import.process! }.to change { user_without_password.reload.encrypted_password }
      end

      it 'should not update password for existing user with password' do
        import = Imports::UserImport.new(client_id: client.id, importer: super_admin, file: @file)
        expect { import.process! }.not_to change { user_with_password.reload.encrypted_password }
      end

      it 'should add existing user who try update existing password to existing_users_whose_password_not_changed' do
        import = Imports::UserImport.new(client_id: client.id, importer: super_admin, file: @file)
        import.process!
        expect(import.existing_users_whose_password_not_changed).to include(user_with_password)
      end

      it 'should not add existing user who password was update to existing_users_whose_password_not_changed' do
        import = Imports::UserImport.new(client_id: client.id, importer: super_admin, file: @file)
        import.process!
        expect(import.existing_users_whose_password_not_changed).not_to include(user_without_password)
      end
    end
  end
end
