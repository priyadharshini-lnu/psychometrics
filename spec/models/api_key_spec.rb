require 'rails_helper'

RSpec.describe ApiKey, type: :model do
  it { should belong_to(:user).inverse_of(:api_keys) }

  it { should validate_presence_of(:key) }
  it { should validate_presence_of(:token) }

  it { should have_db_index(:encrypted_token_iv).unique(true) }
  it { should have_db_index(:key).unique(true) }
end
