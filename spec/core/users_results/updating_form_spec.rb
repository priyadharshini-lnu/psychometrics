require 'rails_helper'

describe ::UsersResults::UpdatingForm do
  subject { described_class.new }
  it do
    is_expected.to respond_to(:status, :answers, :embedded_data, :norm_data)
  end
end
