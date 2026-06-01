# frozen_string_literal: true

# In controller specs the AdminContextResolver middleware does not run,
# so Current.client_admin_context? / Current.root_domain? are unset.
# Skip enforce_root_domain_isolation which depends on that middleware state.
RSpec.configure do |config|
  config.before(:each, type: :controller) do
    next unless described_class.ancestors.include?(Administration::BaseController)

    allow(controller).to receive(:enforce_root_domain_isolation)
  end
end
