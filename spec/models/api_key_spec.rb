require 'rails_helper'

RSpec.describe ApiKey, type: :model do
  it { should belong_to(:user).inverse_of(:api_keys) }

  it 'generate a token when create' do
    api_key = described_class.create(user: create(:user), token: nil)
    expect(api_key.token).not_to be_nil
  end
end
