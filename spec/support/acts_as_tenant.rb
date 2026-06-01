# frozen_string_literal: true

RSpec.configure do |config|
  config.before(:each) do
    ActsAsTenant.current_tenant = nil
    ActsAsTenant.test_tenant = nil
  end

  config.after(:each) do
    ActsAsTenant.current_tenant = nil
    ActsAsTenant.test_tenant = nil
  end
end
