# frozen_string_literal: true

class SamlServiceProvider < ApplicationRecord
  belongs_to :project, class_name: 'Client'
  include Tenantable

  include ApplicationConfigurationLoggable

  enum :integration_type, {
    generic: 0,
    yoodli: 1
  }, prefix: :integration

  validates :name, presence: true
  validates :entity_id, presence: true, uniqueness: { scope: :project_id }
  validates :acs_urls, presence: true
  validate :validate_acs_urls_format

  scope :enabled, -> { where(enabled: true) }
  scope :saml_service_providers_of, ->(project_id) { where(project_id: project_id) }

  before_create :generate_idp_certificate

  def display_name
    name.presence || entity_id
  end

  def issuer_uri
    "#{Utility::Url.generate(:root_url, subdomain: project.subdomain)}saml/idp/metadata/#{id}"
  end

  def sso_service_url
    "#{Utility::Url.generate(:root_url, subdomain: project.subdomain)}saml/idp/auth/#{id}"
  end

  def idp_certificate
    return nil if encrypted_idp_certificate.blank?

    Encryptor.decrypt(Base64.decode64(encrypted_idp_certificate))
  end

  def idp_private_key
    return nil if encrypted_idp_private_key.blank?

    Encryptor.decrypt(Base64.decode64(encrypted_idp_private_key))
  end

  def rotate_certificate!
    cert_data = Saml::CertificateGenerator.generate_self_signed_certificate

    self.encrypted_idp_certificate = Base64.encode64(Encryptor.encrypt(cert_data[:certificate]))
    self.encrypted_idp_private_key = Base64.encode64(Encryptor.encrypt(cert_data[:private_key]))

    save!
  end

  def self.ransackable_scopes(_)
    %i[filterable_fields]
  end

  def self.ransackable_attributes(_auth_object = nil)
    %w[id name entity_id acl_urls active]
  end

  def integration_connected?
    !integration_generic?
  end

  scope :filterable_fields, lambda { |query|
    where(
      <<~SQL.squish,
        saml_service_providers.name ILIKE :query OR#{' '}
        saml_service_providers.entity_id ILIKE :query OR#{' '}
        saml_service_providers.acs_urls::text ILIKE :query
      SQL
      query: "%#{query}%"
    )
  }

  private

  def validate_acs_urls_format
    return if acs_urls.blank?

    urls = acs_urls.is_a?(Array) ? acs_urls : [acs_urls]
    urls.each do |url|
      unless url.match?(URI::DEFAULT_PARSER.make_regexp(%w[http https]))
        errors.add(:acs_urls, "#{url} is not a valid URL")
      end
    end
  end

  def generate_idp_certificate
    return if encrypted_idp_certificate.present? && encrypted_idp_private_key.present?

    cert_data = Saml::CertificateGenerator.generate_self_signed_certificate

    self.encrypted_idp_certificate = Base64.encode64(Encryptor.encrypt(cert_data[:certificate]))
    self.encrypted_idp_private_key = Base64.encode64(Encryptor.encrypt(cert_data[:private_key]))
  end
end
