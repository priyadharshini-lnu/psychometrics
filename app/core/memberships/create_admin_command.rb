# frozen_string_literal: true

module Memberships
  class CreateAdminCommand < Rectify::Command
    attr_reader :membership, :role, :client, :creator

    def initialize(membership, client, creator, role)
      @membership = membership
      @creator = creator
      @role = role
      @client = client
    end

    def call
      membership.tap do |m|
        m.role = role
        m.client = client
      end
      admin = User.find_by(email: membership.user&.email, project_id: nil)
      if admin
        membership.user = admin
      else
        membership.user.tap do |u|
          u.create_by_invite = true
          u.created_by_id = creator.id
          u.modified_by_id = creator.id
          u.role = 'Users::Admin'
          u.invite!(creator, client.id)
        end
      end
      if membership.save
        broadcast :ok, membership
      else
        broadcast :invalid
      end
    end
  end
end
