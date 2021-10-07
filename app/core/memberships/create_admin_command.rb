# frozen_string_literal: true

module Memberships
  class CreateAdminCommand < Rectify::Command
    attr_reader :membership, :role, :client, :creator, :campaign

    def initialize(membership, client, creator, role, campaign = nil)
      @membership = membership
      @creator = creator
      @role = role
      @client = client
      @campaign = campaign
    end

    def call
      membership.tap do |m|
        m.role = role
        m.client = client
        m.campaign = campaign if campaign
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
        end
      end
      if membership.save!
        membership.reload.user.invite!(creator, client.id)
        broadcast :ok, membership
      else
        broadcast :invalid
      end
    end
  end
end
