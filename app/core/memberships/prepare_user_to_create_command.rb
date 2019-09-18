# frozen_string_literal: true

module Memberships
  class PrepareUserToCreateCommand < Rectify::Command
    attr_reader :form, :grants

    def initialize(form, grants)
      @form = form
      @grants = grants
    end

    def call
      return broadcast :invalid if form.invalid?

      user = User.find_or_create_by(email: form.email, project_id: nil)
      membership = Membership.new(user: user)
      membership.build_grants(data: grants)
      broadcast :ok, membership
    end
  end
end
