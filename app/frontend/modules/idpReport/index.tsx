import img from '~/assets/TTE_Logo_Color_Monogram.png'

const { I18n } = window
I18n.locale = document.body.getAttribute('data-locale')

const IdpReport = () => (
  <div style={{ width: 849, textAlign: 'center' }}>
    <h1>
      {I18n.t('idp.pdf.header')}
    </h1>
    <h3>thsis is IDP Report placeholder</h3>
    <div style={{ padding: 20 }}><img style={{ maxWidth: 100 }} src={img} /></div>
  </div>
)

export default IdpReport
