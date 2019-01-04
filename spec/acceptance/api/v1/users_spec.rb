require 'rails_helper'
require 'rspec_api_documentation/dsl'

resource "Users" do
  header 'Accept', 'application/json'
  header 'Content-Type', 'application/json'
  explanation 'Users within particular project'
  post "/api/v1/projects/:project_id/users" do
    route_summary 'Adds a new user to the project'
    example "create" do
      do_request

      status.should == 200
    end
  end
end
