require 'rails_helper'

RSpec.describe User, type: :model do
  it { should have_many(:api_keys).inverse_of(:user) }
end
