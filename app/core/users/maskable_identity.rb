# frozen_string_literal: true

module Users
  class MaskableIdentity
    private_attr_reader :user, :mask

    def initialize(user, mask: false)
      @user = user
      @mask = mask
    end

    def first_name
      return user.first_name unless mask

      user.id.to_s
    end

    def last_name
      return user.last_name unless mask

      user.id.to_s
    end

    def email
      return user.email unless mask

      "#{user.id}@example.com"
    end

    def full_name
      [first_name, last_name].compact.join(' ')
    end
  end
end
