# frozen_string_literal: true

require 'rails_helper'

describe Branding do
  def stub_brand(brand)
    allow(Settings).to receive(:branding).and_return(
      Config::Options.new.merge!(
        brand: brand,
        support_email: 'surveys@example.com',
        support_contact_email: 'support@example.com',
        assets: {
          'marsh' => { email_logo: 'branding/marsh/email-logo.png' },
          'mercer_a_marsh_business' => { email_logo: 'branding/mercer_a_marsh_business/email-logo.png' }
        }
      )
    )
  end

  def stub_notice_version(version)
    allow(Settings).to receive(:privacy_notice).and_return(
      Config::Options.new.merge!(
        version: version,
        logos: {
          'marsh' => 'branding/marsh/wordmark-navy.svg',
          'mercer_a_marsh_business' => 'branding/mercer_a_marsh_business/wordmark-navy.svg'
        }
      )
    )
  end

  it 'reads the brand from Settings, with no request in scope' do
    stub_brand('mercer_a_marsh_business')

    expect(described_class.brand).to eq('mercer_a_marsh_business')
  end

  it 'resolves the names of the configured brand' do
    stub_brand('mercer_a_marsh_business')

    expect(described_class.display_name).to eq('Mercer, a Marsh business')
    expect(described_class.legal_name).to eq('Mercer Talent Enterprise')
  end

  it 'resolves the default brand names' do
    stub_brand('marsh')

    expect(described_class.display_name).to eq('Marsh')
    expect(described_class.legal_name).to eq('Marsh')
  end

  it 'serves the same names in every locale, with no I18n lookup left to override' do
    stub_brand('marsh')
    I18n.backend.store_translations(:fr, branding: { marsh: { display_name: 'Marsh FR' } })

    expect(described_class.display_name).to eq('Marsh')
    expect(I18n.with_locale(:fr) { described_class.display_name }).to eq('Marsh')
    expect(I18n.with_locale(:fr) { described_class.legal_name }).to eq('Marsh')
  end

  it 'raises on a brand it holds no names for, rather than serving a blank one' do
    stub_brand('no_such_brand')

    expect { described_class.display_name }.to raise_error(KeyError)
    expect { described_class.legal_name }.to raise_error(KeyError)
  end

  it 'keeps the product name outside the brand blocks' do
    stub_brand('mercer_a_marsh_business')
    expect(described_class.product_name).to eq('Lighthouse')

    stub_brand('marsh')
    expect(described_class.product_name).to eq('Lighthouse')
  end

  it 'exposes the support addresses from Settings' do
    stub_brand('marsh')

    expect(described_class.support_email).to eq('surveys@example.com')
    expect(described_class.support_contact_email).to eq('support@example.com')
  end

  it 'resolves the assets of the configured brand' do
    stub_brand('mercer_a_marsh_business')

    expect(described_class.email_logo).to eq('branding/mercer_a_marsh_business/email-logo.png')
  end

  it 'resolves the default brand assets' do
    stub_brand('marsh')

    expect(described_class.email_logo).to eq('branding/marsh/email-logo.png')
  end

  describe '.privacy_notice' do
    it 'serves the selected version once it has copy' do
      stub_notice_version('legal_draft')
      I18n.backend.store_translations(:en, privacy_notice: { legal_draft: '<p>Draft notice</p>' })

      expect(described_class.privacy_notice).to eq('<p>Draft notice</p>')
    end

    it 'serves the published notice, and warns, when the selected version is still a placeholder' do
      stub_notice_version('unwritten_draft')
      I18n.backend.store_translations(:en, privacy_notice: { unwritten_draft: '<!-- not written yet -->' })
      allow(Rails.logger).to receive(:warn)

      expect(described_class.privacy_notice).to eq(I18n.t('privacy_notice.marsh'))
      expect(Rails.logger).to have_received(:warn).with(/"unwritten_draft" has no copy yet/)
    end

    it 'serves the published notice when the selected version does not exist at all' do
      stub_notice_version('no_such_version')
      allow(Rails.logger).to receive(:warn)

      expect(described_class.privacy_notice).to eq(I18n.t('privacy_notice.marsh'))
    end

    it 'falls back within the reader locale rather than dropping to English' do
      stub_notice_version('no_such_version')
      allow(Rails.logger).to receive(:warn)

      expect(described_class.privacy_notice(locale: :fr)).to eq(I18n.t('privacy_notice.marsh', locale: :fr))
      expect(described_class.privacy_notice(locale: :fr)).not_to eq(I18n.t('privacy_notice.marsh', locale: :en))
    end

    it 'does not derive the version from the brand' do
      stub_brand('mercer_a_marsh_business')
      stub_notice_version('marsh')

      expect(described_class.privacy_notice).to eq(I18n.t('privacy_notice.marsh'))
    end
  end

  describe '.policy_logo' do
    it 'follows the notice version rather than the brand' do
      stub_brand('marsh')
      stub_notice_version('mercer_a_marsh_business')

      expect(described_class.policy_logo).to eq('branding/mercer_a_marsh_business/wordmark-navy.svg')
    end

    it 'serves each published version its own logo' do
      stub_brand('marsh')

      stub_notice_version('marsh')
      expect(described_class.policy_logo).to eq('branding/marsh/wordmark-navy.svg')

      stub_notice_version('mercer_a_marsh_business')
      expect(described_class.policy_logo).to eq('branding/mercer_a_marsh_business/wordmark-navy.svg')
    end

    it 'serves the published logo, and warns, when the selected version has none' do
      stub_brand('mercer_a_marsh_business')
      stub_notice_version('legal_draft')
      allow(Rails.logger).to receive(:warn)

      expect(described_class.policy_logo).to eq('branding/marsh/wordmark-navy.svg')
      expect(Rails.logger).to have_received(:warn).with(/"legal_draft" has no logo/)
    end
  end

  describe '.policy_logo_name' do
    it 'names the brand whose wordmark the version carries, not the deployed brand' do
      stub_brand('marsh')

      stub_notice_version('mercer_a_marsh_business')
      expect(described_class.policy_logo_name).to eq('Mercer, a Marsh business')

      stub_notice_version('marsh')
      expect(described_class.policy_logo_name).to eq('Marsh')
    end

    it 'falls back with the logo, so the alt text never describes another image' do
      stub_brand('mercer_a_marsh_business')
      stub_notice_version('legal_draft')
      allow(Rails.logger).to receive(:warn)

      expect(described_class.policy_logo_name).to eq('Marsh')
    end

    it 'names the version the same way in every locale' do
      stub_brand('marsh')
      stub_notice_version('marsh')
      I18n.backend.store_translations(:fr, branding: { marsh: { display_name: 'Marsh FR' } })

      expect(I18n.with_locale(:fr) { described_class.policy_logo_name }).to eq('Marsh')
    end
  end
end
