# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CommunicationEmailResource, type: :model do
  describe 'validations' do
    it 'is valid with valid attributes' do
      communication_email = create(:communication_email)
      resource = create(:user_report)

      communication_email_resource = CommunicationEmailResource.new(
        communication_email: communication_email,
        resource: resource
      )

      expect(communication_email_resource).to be_valid
    end

    it 'is not valid without a resource' do
      communication_email = create(:communication_email)

      communication_email_resource = CommunicationEmailResource.new(
        communication_email: communication_email,
        resource: nil
      )

      expect(communication_email_resource).to_not be_valid
      expect(communication_email_resource.errors[:resource]).to include("can't be blank")
    end
  end

  describe 'associations' do
    it { should belong_to(:communication_email) }
    it { should belong_to(:resource) }
  end
end
