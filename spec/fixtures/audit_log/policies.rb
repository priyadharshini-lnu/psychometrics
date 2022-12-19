# frozen_string_literal: true

module Dummy
  class Base < Api::Administration::BasePolicy
    def method_missing(_, *_)
      true
    end

    def respond_to_missing?(_, _)
      true
    end
  end

  class PostPolicy < Base
  end

  class CommentPolicy < Base
  end

  class AuthorPolicy < Base
  end

  class CampaignPolicy < Base
  end
end
