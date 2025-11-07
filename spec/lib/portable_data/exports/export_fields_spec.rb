# frozen_string_literal: true

require 'rails_helper'

# Define test models outside of the block
class TestUser < ApplicationRecord
  belongs_to :company, class_name: 'TestCompany', optional: true
  has_many :projects, class_name: 'TestProject'
  has_one_attached :avatar
end

class TestCompany < ApplicationRecord
  has_many :test_users
end

class TestProject < ApplicationRecord
  belongs_to :test_user
end

# Define export class for testing outside of the block
class TestUserExport < PortableData::Exports::ExportFields
  include PortableData::Exports::SchemaConfiguration

  klass TestUser

  attributes :name, :email
  related_resource :projects, model: TestProject
  mappable_attribute :company_id
  attachment_attributes :avatar

  import_order %i[test_companies test_users test_projects]
end

RSpec.describe PortableData::Exports::ExportFields do
  # Create test tables
  before(:all) do
    ActiveRecord::Schema.define do
      create_table :test_users, force: true do |t|
        t.string :name
        t.string :email
        t.datetime :last_login
        t.references :company
        t.timestamps
      end

      create_table :test_companies, force: true do |t|
        t.string :name
        t.text :description
        t.timestamps
      end

      create_table :test_projects, force: true do |t|
        t.string :name
        t.references :test_user
        t.timestamps
      end
    end
  end

  # Clean up test tables after all tests are run
  after(:all) do
    ActiveRecord::Schema.define do
      drop_table :test_users if ActiveRecord::Base.connection.table_exists?(:test_users)
      drop_table :test_companies if ActiveRecord::Base.connection.table_exists?(:test_companies)
      drop_table :test_projects if ActiveRecord::Base.connection.table_exists?(:test_projects)
    end

    # Remove defined constants to avoid polluting global namespace (optional)
    Object.send(:remove_const, :TestUser) if defined?(TestUser)
    Object.send(:remove_const, :TestCompany) if defined?(TestCompany)
    Object.send(:remove_const, :TestProject) if defined?(TestProject)
    Object.send(:remove_const, :TestUserExport) if defined?(TestUserExport)
  end

  let(:company) { TestCompany.create!(name: 'Test Corp', description: 'A test company') }
  let(:user) { TestUser.create!(name: 'John Doe', email: 'john@example.com', company: company) }
  let!(:project) { TestProject.create!(name: 'Test Project', test_user: user) }

  describe '#serialize' do
    subject(:export) { TestUserExport.new(user) }

    it 'serializes basic attributes' do
      result = export.serialize
      user_data = result[:resources][:test_users][:data]
      expect(user_data[:name]).to eq('John Doe')
      expect(user_data[:email]).to eq('john@example.com')
    end

    it 'includes schema information' do
      result = export.serialize
      schema = result[:resources][:test_users][:schema]

      expect(schema).to include(
        { name: :name, type: ['primitive'] },
        { name: :email, type: ['primitive'] }
      )
    end

    context 'with relationships' do
      it 'serializes related resources' do
        result = export.serialize
        user_data = result[:resources][:test_users][:data]
        project_data = result[:resources][:test_projects][:data].first

        expect(user_data[:company_id]).to eq(company.id)
        expect(project_data[:name]).to eq(project.name)
      end
    end

    context 'with attachments' do
      before do
        user.avatar.attach(
          io: StringIO.new('dummy image content'),
          filename: 'avatar.jpg',
          content_type: 'image/jpeg'
        )
      end

      it 'serializes attachments' do
        result = export.serialize
        user_data = result[:resources][:test_users][:data]
        expect(user_data[:avatar]).to be_present
      end
    end

    describe 'meta information' do
      it 'includes version and timestamp information' do
        result = export.serialize

        expect(result[:meta][:exported_date]).to be_present
        expect(result[:meta][:last_updated_at]).to be_present
        expect(result[:meta][:hmac_signature]).to be_present
      end
    end

    context 'with invalid resource import order' do
      before do
        TestUserExport.resource_import_order = %w[test_companies test_users invalid_resource]
      end

      it 'raises an error for invalid resource names' do
        expect { export.serialize }.to raise_error(
          RuntimeError,
          'Invalid resource specified in resource_import_order: test_users, test_projects'
        )
      end
    end
  end
end
