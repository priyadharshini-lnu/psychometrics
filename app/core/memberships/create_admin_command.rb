module Memberships
  class CreateAdminCommand < Rectify::Command
    include Pundit
    include Administration::Policies
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
      admin = ::Users::Admin.find_by(email: membership.user&.email, project_id: nil)
      if admin
        membership.user = admin
      else
        membership.user.tap do |u|
          u.create_by_invite = true
          u.created_by_id = creator.id
          u.modified_by_id = creator.id
          u.role = 'Users::Admin'
        end
      end
      if membership.save
        membership.user.invite!(creator, client.id)
        broadcast :ok, membership
      else
        broadcast :invalid
      end
    end
  end
end
