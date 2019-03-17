require 'rails_helper'

describe ApplicationController, type: :controller do
  it { should use_before_action(:set_client_by_subdomain) }
  it { should use_before_action(:set_membership) }
  it { should use_after_action(:allow_iframe) }
end
