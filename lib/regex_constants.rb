# frozen_string_literal: true

module RegexConstants
  DOMAIN_REGEX = /\A((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\Z/
  SHEET_COLUMN_REGEX = /\A[\w\s.-]+\z/
  LUA_VARIABLE = /^[A-Za-z_][A-za-z0-9_]*$/
  LUA_GLOBLA_VAR = /^[a-zA-Z_]\w*\s*=\s*(?:"[^"]*"|\d+(?:\.\d+)?)$/
  DANGEROUS_CSV_EXPORT_START_CHARS = /^[=+\-@\t\r|%]/
end
