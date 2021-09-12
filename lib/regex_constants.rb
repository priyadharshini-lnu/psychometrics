# frozen_string_literal: true

module RegexConstants
  DOMAIN_REGEX = /\A((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\Z/.freeze
end
