# frozen_string_literal: true

require 'rails_helper'

describe ::Users::CreateOrModifyGlobalAssessor do
  describe '#call' do
    let(:current_user) { create(:user) }
    let(:resource_params) do
      {
        email: Faker::Internet.email,
        first_name: Faker::Name.first_name,
        last_name: Faker::Name.last_name
      }
    end

    context 'when creating a new user' do
      it 'creates a new global assessor user' do
        described_class.call!(current_user, resource_params)
        created_user = User.find_by(resource_params)
        expect(created_user.email).to eq(resource_params[:email])
        expect(created_user.global_assessor).to be_truthy
        expect(created_user.created_by_id).to eq(current_user.id)
        expect(created_user.modified_by_id).to eq(current_user.id)
        expect(created_user.role).to eq(User::ADMIN_ROLE)
      end

      it 'broadcasts :ok with the created user' do
        expect { described_class.call!(current_user, resource_params) }.
          to broadcast(:ok, kind_of(User))
      end
    end

    context 'when user with the same email already exists' do
      let!(:existing_user) { create(:user, email: resource_params[:email], project_id: nil) }

      it 'modifies the existing user as a global assessor' do
        described_class.call!(current_user, resource_params)
        existing_user.reload
        expect(existing_user.global_assessor).to be_truthy
        expect(existing_user.modified_by_id).to eq(current_user.id)
      end

      it 'broadcasts :ok with the modified user' do
        expect { described_class.call!(current_user, resource_params) }.
          to broadcast(:ok, existing_user)
      end
    end
  end
end
